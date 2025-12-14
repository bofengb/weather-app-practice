import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import WeatherMap from '@/components/map/WeatherMap';
import MapControls from '@/components/map/MapControls';
import MapLegend from '@/components/map/MapLegend';
import { Skeleton } from '@/components/ui/skeleton';
import useMapData from '@/hooks/useMapData';
import useFavorites from '@/hooks/useFavorites';
import type { MapMarker, MapFilters } from '@/types';

export default function Map() {
  const [searchParams] = useSearchParams();
  const { markers, counts, loading, refetch } = useMapData();
  const { addFavorite, isFavorited, canAddMore } = useFavorites();

  // dedupe: hide history markers that are already favorited
  // One location can only have one pin
  const dedupedMarkers = useMemo(
    () =>
      markers.filter((m) => m.type !== 'history' || !isFavorited(m.lat, m.lon)),
    [markers, isFavorited]
  );

  // Lift state up
  const [filters, setFilters] = useState<MapFilters>({
    showFavorites: true,
    showHistory: true,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // useMemo computes initial center synchronously before render
  const initialCenter = useMemo((): [number, number] => {
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    if (!isNaN(lat) && !isNaN(lon)) {
      return [lat, lon];
    }
    return [40.7128, -74.006]; // Default: New York
  }, [searchParams]);

  const initialZoom = useMemo(
    () => (searchParams.has('lat') ? 6 : 4),
    [searchParams]
  );

  // Handle favorite toggle from popup
  const handleFavoriteToggle = useCallback(
    async (marker: MapMarker) => {
      if (isFavorited(marker.lat, marker.lon)) {
        toast.error('Already in favorites');
        return;
      }

      if (!canAddMore) {
        toast.error('Maximum 10 favorites allowed');
        return;
      }

      try {
        await addFavorite({
          cityName: marker.label || marker.cityName || '',
          country: marker.country || '',
          lat: marker.lat,
          lon: marker.lon,
        });
        toast.success('Added to favorites');
        refetch();
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to add to favorites');
      }
    },
    [addFavorite, isFavorited, canAddMore, refetch]
  );

  // Refresh map data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Map refreshed');
  }, [refetch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="h-[calc(100vh-4rem)]">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      {/* relative parent + absolute children = controls float over map */}
      <div className="h-[calc(100vh-4rem)] relative">
        <WeatherMap
          markers={dedupedMarkers}
          center={initialCenter}
          zoom={initialZoom}
          filters={filters}
          onFavoriteToggle={handleFavoriteToggle}
        />

        <MapControls
          filters={filters}
          onFilterChange={setFilters}
          counts={counts}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <MapLegend />
      </div>
    </div>
  );
}
