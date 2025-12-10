import { Request, Response } from 'express';
import User from '../models/User.js';
import SearchHistory from '../models/SearchHistory.js';
import type {
  SaveSearchRequest,
  AddFavoriteRequest,
  HistoryQueryParams,
  PaginationInfo,
  StatisticsOverview,
  MostSearchedCity,
} from '../types/index.js';
import { Types } from 'mongoose';

export const saveSearchHistory = async (
  req: Request<{}, {}, SaveSearchRequest>,
  res: Response
): Promise<void> => {
  try {
    const {
      cityName,
      country,
      lat,
      lon,
      temperature,
      feelsLike,
      humidity,
      windSpeed,
      weatherCondition,
      weatherIcon,
    } = req.body;

    if (!cityName || !lat || !lon) {
      res.status(400).json({
        error: 'City name, latitude, and longitude are required.',
      });
      return;
    }

    // User isolation: req.user.id from verified JWT ensures user owns this data
    const searchHistory = await SearchHistory.create({
      userId: req.user!.id,
      cityName,
      country,
      lat,
      lon,
      temperature,
      feelsLike,
      humidity,
      windSpeed,
      weatherCondition,
      weatherIcon,
    });

    res.json(searchHistory);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getSearchHistory = async (
  req: Request<{}, {}, {}, HistoryQueryParams>,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '20');
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Server-side pagination: client only gets one page at a time
    const skip = (page - 1) * limit;
    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder }; // Dynamic Key Access

    const history = await SearchHistory.find({ userId: req.user!.id })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // Plain JS objects, no Mongoose overhead

    const total = await SearchHistory.countDocuments({ userId: req.user!.id });

    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    res.json({ history, pagination });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const deleteSearchHistory = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // User isolation: req.user.id from verified JWT ensures user owns this data
    const deleted = await SearchHistory.findOneAndDelete({
      _id: id,
      userId: req.user!.id,
    });

    if (!deleted) {
      res.status(404).json({ error: 'History item not found' });
      return;
    }

    res.json({ success: true, message: 'History item deleted' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Favorites are embedded in User doc. No separate collection.
export const addFavorite = async (
  req: Request<{}, {}, AddFavoriteRequest>,
  res: Response
): Promise<void> => {
  try {
    const { cityName, country, lat, lon } = req.body;

    if (!cityName || !lat || !lon) {
      res.status(400).json({
        error: 'City name, latitude, and longitude are required.',
      });
      return;
    }

    const userDoc = await User.findById(req.user!.id);

    if (!userDoc) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const alreadyFavorited = userDoc.favorites.some(
      (fav) => fav.lat === lat && fav.lon === lon
    );

    if (alreadyFavorited) {
      res.status(400).json({ error: 'City already in favorites' });
      return;
    }

    // Hard limit of 10
    if (userDoc.favorites.length >= 10) {
      res.status(400).json({
        error: 'Maximum 10 favorites allowed. Please remove one first.',
      });
      return;
    }

    userDoc.favorites.push({
      cityName,
      country,
      lat,
      lon,
      addedAt: new Date(),
    });

    await userDoc.save();

    res.json({
      success: true,
      favorites: userDoc.favorites,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getFavorites = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userDoc = await User.findById(req.user!.id).select('favorites');
    res.json({ favorites: userDoc?.favorites || [] });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const removeFavorite = async (
  req: Request<{ id: string }>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const userDoc = await User.findByIdAndUpdate(
      req.user!.id,
      { $pull: { favorites: { _id: id } } },
      { new: true }
    );

    if (!userDoc) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      favorites: userDoc.favorites,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getStatistics = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = new Types.ObjectId(req.user!.id);

    const stats = await SearchHistory.aggregate<
      StatisticsOverview & { _id: null }
    >([
      { $match: { userId } },
      {
        $group: {
          _id: null, // Group ALL matching docs into one bucket
          totalSearches: { $sum: 1 },
          avgTemperature: { $avg: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          minTemperature: { $min: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
        },
      },
    ]);

    const mostSearchedCities = await SearchHistory.aggregate<MostSearchedCity>([
      { $match: { userId } },
      {
        $group: {
          _id: '$cityName',
          count: { $sum: 1 },
          country: { $first: '$country' }, // Grabs from first doc in group
          lastSearched: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } }, // Descending by count
      { $limit: 5 },
    ]);

    const hottestSearch = await SearchHistory.findOne({ userId: req.user!.id })
      .sort({ temperature: -1 })
      .limit(1);

    const coldestSearch = await SearchHistory.findOne({ userId: req.user!.id })
      .sort({ temperature: 1 })
      .limit(1);

    res.json({
      overview: stats[0] || {
        totalSearches: 0,
        avgTemperature: 0,
        maxTemperature: 0,
        minTemperature: 0,
        avgHumidity: 0,
      },
      mostSearchedCities,
      extremes: {
        hottest: hottestSearch,
        coldest: coldestSearch,
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
