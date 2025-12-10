import { Request, Response } from 'express';
import User from '../models/User.js';
import SearchHistory from '../models/SearchHistory.js';
import type {
  MapQueryParams,
  FavoriteMarker,
  HistoryMarker,
} from '../types/index.js';

export const getMapData = async (
  req: Request<{}, {}, {}, MapQueryParams>,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { includeHistory = 'true', limit = '50' } = req.query;

    // Promise.all runs queries in parallel: total time = max(query1, query2)
    const [user, recentHistory] = await Promise.all([
      User.findById(userId).select('favorites').lean(), // Plain JS, no Mongoose methods
      // Ternary returns either real query or Promise.resolve([]) as placeholder
      includeHistory === 'true'
        ? SearchHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean()
        : Promise.resolve([]),
    ]);

    const favoriteMarkers: FavoriteMarker[] = (user?.favorites || []).map(
      (f) => ({
        type: 'favorite' as const,
        id: f._id!.toString(),
        lat: f.lat,
        lon: f.lon,
        label: f.cityName,
        country: f.country,
        addedAt: f.addedAt,
      })
    );

    const historyMarkers: HistoryMarker[] = recentHistory.map((h) => ({
      type: 'history' as const,
      id: h._id.toString(),
      lat: h.lat,
      lon: h.lon,
      label: h.cityName,
      country: h.country,
      temperature: h.temperature,
      searchedAt: h.createdAt,
    }));

    const markers = [...favoriteMarkers, ...historyMarkers];

    res.json({
      markers,
      counts: {
        favorites: user?.favorites?.length || 0,
        history: recentHistory.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
