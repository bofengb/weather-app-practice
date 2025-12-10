import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch favorites from backend
  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get('/api/v1/favorites');
      setFavorites(data.favorites || []);
    } catch (err) {
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
  const addFavorite = useCallback(async (cityData) => {
    // Temp ID for React key - will be replaced with MongoDB _id on success
    const newFavorite = {
      ...cityData,
      _id: `temp-${Date.now()}`,
      addedAt: new Date(),
    };
    setFavorites((prev) => [...prev, newFavorite]);

    try {
      const { data } = await axios.post('/api/v1/favorites', cityData);
      // Replace with server response (has real _id)
      setFavorites(data.favorites);
      return data;
    } catch (err) {
      // Rollback: remove the optimistically added favorite
      setFavorites((prev) => prev.filter((fav) => fav._id !== newFavorite._id));
      console.error('Error adding favorite:', err);
      throw err;
    }
  }, []);

  // Remove favorite with optimistic update
  const removeFavorite = useCallback(
    async (id) => {
      // Optimistic update - remove from UI immediately
      const previousFavorites = [...favorites];
      setFavorites((prev) => prev.filter((fav) => fav._id !== id));

      try {
        const { data } = await axios.delete(`/api/v1/favorites/${id}`);
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
    (lat, lon) => {
      return favorites.some(
        (fav) =>
          Math.abs(fav.lat - lat) < 0.01 && Math.abs(fav.lon - lon) < 0.01
      );
    },
    [favorites]
  );

  // Get favorite ID by coordinates
  const getFavoriteId = useCallback(
    (lat, lon) => {
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
