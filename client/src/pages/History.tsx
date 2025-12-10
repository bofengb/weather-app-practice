import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useSearchHistory from '@/hooks/useSearchHistory';
import { getTempColor } from '@/lib/weather';
import {
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Map as MapIcon,
} from 'lucide-react';

interface SortIconProps {
  field: string;
}

export default function History() {
  // History uses server-side pagination. Client only has current page
  // Sorting must be performed on server since client doesn't have full dataset
  const { history, loading, pagination, fetchHistory, deleteHistory } =
    useSearchHistory();
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const navigate = useNavigate();

  // Toggle sort direction if clicking same column, else reset to desc
  const handleSort = (field: string) => {
    if (sortBy === field) {
      const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newOrder);
      fetchHistory(pagination.page, field, newOrder);
    } else {
      setSortBy(field);
      setSortOrder('desc');
      fetchHistory(pagination.page, field, 'desc');
    }
  };

  const handleDelete = async (id: string, cityName: string) => {
    if (window.confirm(`Delete search for ${cityName}?`)) {
      try {
        await deleteHistory(id);
        toast.success('Search deleted');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchHistory(newPage, sortBy, sortOrder);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const SortIcon = ({ field }: SortIconProps) => {
    if (sortBy !== field)
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Search History</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No search history yet.
              </p>
              <Link to="/weather" className="text-primary hover:underline">
                Search for a city to get started
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Date <SortIcon field="createdAt" />
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => handleSort('cityName')}
                      >
                        <div className="flex items-center gap-1">
                          City <SortIcon field="cityName" />
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-sm font-medium cursor-pointer hover:bg-accent"
                        onClick={() => handleSort('temperature')}
                      >
                        <div className="flex items-center gap-1">
                          Temp <SortIcon field="temperature" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">
                        Humidity
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">
                        Wind
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium hidden lg:table-cell">
                        Condition
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map((item) => (
                      <tr key={item._id} className="hover:bg-accent/50">
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{item.cityName}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.country}
                          </div>
                        </td>
                        <td
                          className={`px-4 py-3 font-medium ${getTempColor(item.temperature || 0)}`}
                        >
                          {item.temperature?.toFixed(1)}°C
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                          {item.humidity}%
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                          {item.windSpeed?.toFixed(1)} km/h
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">
                          {item.weatherCondition}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/map?lat=${item.lat}&lon=${item.lon}`)
                            }
                            title="View on map"
                          >
                            <MapIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDelete(item._id, item.cityName)
                            }
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {pagination.pages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </Button>
              </div>
            )}

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Showing {history.length} of {pagination.total} searches
            </p>
          </>
        )}
      </main>
    </div>
  );
}
