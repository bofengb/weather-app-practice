import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type {
  MapMarker,
  MapCounts,
  MapDataResponse,
  UseMapDataOptions,
} from '@/types';

const useMapData = (options: UseMapDataOptions = {}) => {
  const { includeHistory = true, historyLimit = 50 } = options;

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [counts, setCounts] = useState<MapCounts>({ favorites: 0, history: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // isInitial flag controls loading skeleton behavior:
  // - First load (isInitial=true): show skeleton, map not ready yet
  // - Refresh (isInitial=false): keep map visible while data updates in background
  const fetchMapData = useCallback(
    async (isInitial: boolean = false) => {
      if (isInitial) setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get<MapDataResponse>('/api/v1/map/data', {
          params: {
            includeHistory: includeHistory.toString(),
            limit: historyLimit,
          },
        });

        setMarkers(data.markers || []);
        setCounts(data.counts || { favorites: 0, history: 0 });
      } catch (err: any) {
        console.error('Error fetching map data:', err);
        setError(err.response?.data?.error || 'Failed to fetch map data');
      } finally {
        setLoading(false);
      }
    },
    [includeHistory, historyLimit]
  );

  useEffect(() => {
    fetchMapData(true);
  }, [fetchMapData]);

  return {
    markers,
    counts,
    loading,
    error,
    refetch: fetchMapData,
  };
};

export default useMapData;
