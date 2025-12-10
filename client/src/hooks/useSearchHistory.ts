import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type {
  SearchHistory,
  SearchHistoryInput,
  Pagination,
  HistoryResponse,
} from '@/types';

const useSearchHistory = () => {
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  // Fetch search history with pagination and sorting
  const fetchHistory = useCallback(
    async (
      page: number = 1,
      sortBy: string = 'createdAt',
      sortOrder: string = 'desc'
    ) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await axios.get<HistoryResponse>('/api/v1/history', {
          params: {
            page,
            limit: 20,
            sortBy,
            sortOrder,
          },
        });

        setHistory(data.history);
        setPagination(data.pagination);
      } catch (err: any) {
        console.error('Error fetching history:', err);
        setError(err.response?.data?.error || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const saveSearch = useCallback(
    async (searchData: SearchHistoryInput): Promise<SearchHistory> => {
      try {
        const { data } = await axios.post<SearchHistory>(
          '/api/v1/history',
          searchData
        );
        return data;
      } catch (err) {
        console.error('Error saving search:', err);
        throw err;
      }
    },
    []
  );

  // Delete history item with optimistic update
  const deleteHistory = useCallback(
    async (id: string) => {
      // Optimistic update - remove from UI immediately
      const previousHistory = [...history];
      setHistory((prev) => prev.filter((item) => item._id !== id));

      try {
        await axios.delete(`/api/v1/history/${id}`);
        // Update pagination total count
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));
      } catch (err) {
        // Revert on error
        setHistory(previousHistory);
        console.error('Error deleting history:', err);
        throw err;
      }
    },
    [history]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    pagination,
    fetchHistory,
    saveSearch,
    deleteHistory,
  };
};

export default useSearchHistory;
