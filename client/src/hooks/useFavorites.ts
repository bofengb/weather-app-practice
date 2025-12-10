import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import type { Favorite, FavoriteInput, FavoritesResponse } from '@/types';

const useFavorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch favorites from backend
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get<FavoritesResponse>('/api/v1/favorites');
      setFavorites(data.favorites || []);
    } catch (err: any) {
      console.error('Error fetching favorites:', err);
      setError(err.response?.data?.error || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimistic update pattern:
  // 1. Update UI immediately for instant feedback
  // 2. Sync with server in background
  // 3. Rollback if server fails
  const addFavorite = useCallback(
    async (cityData: FavoriteInput): Promise<FavoritesResponse> => {
      // Temp ID for React key - will be replaced with MongoDB _id on success
      const newFavorite: Favorite = {
        ...cityData,
        _id: `temp-${Date.now()}`,
        addedAt: new Date().toISOString(),
      };
      setFavorites((prev) => [...prev, newFavorite]);

      try {
        const { data } = await axios.post<FavoritesResponse>(
          '/api/v1/favorites',
          cityData
        );
        // Replace with server response (has real _id)
        setFavorites(data.favorites);
        return data;
      } catch (err) {
        // Rollback: remove the optimistically added favorite
        setFavorites((prev) =>
          prev.filter((fav) => fav._id !== newFavorite._id)
        );
        console.error('Error adding favorite:', err);
        throw err;
      }
    },
    []
  );

  // Remove favorite with optimistic update
  const removeFavorite = useCallback(
    async (id: string) => {
      // Optimistic update - remove from UI immediately
      const previousFavorites = [...favorites];
      setFavorites((prev) => prev.filter((fav) => fav._id !== id));

      try {
        const { data } = await axios.delete<FavoritesResponse>(
          `/api/v1/favorites/${id}`
        );
        // Update with server response to ensure consistency
        setFavorites(data.favorites);
      } catch (err) {
        // Revert on error
        setFavorites(previousFavorites);
        console.error('Error removing favorite:', err);
        throw err;
      }
    },
    [favorites]
  );

  // Using 0.01 tolerance (~1km) because floating point coordinates aren't exact matches
  const isFavorited = useCallback(
    (lat: number, lon: number): boolean => {
      return favorites.some(
        (fav) =>
          Math.abs(fav.lat - lat) < 0.01 && Math.abs(fav.lon - lon) < 0.01
      );
    },
    [favorites]
  );

  // Get favorite ID by coordinates
  const getFavoriteId = useCallback(
    (lat: number, lon: number): string | undefined => {
      const favorite = favorites.find(
        (fav) =>
          Math.abs(fav.lat - lat) < 0.01 && Math.abs(fav.lon - lon) < 0.01
      );
      return favorite?._id;
    },
    [favorites]
  );

  // useMemo to compute derived state (prevents recalculation)
  const favoritesCount = useMemo(() => favorites.length, [favorites]);
  const canAddMore = useMemo(() => favorites.length < 10, [favorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    error,
    favoritesCount,
    canAddMore,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    isFavorited,
    getFavoriteId,
  };
};

export default useFavorites;
