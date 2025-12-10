import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getWeatherIcon,
  getWeatherDescription,
  getTempColor,
} from '@/lib/weather';
import { Star, Clock, Wind, Droplets, Navigation } from 'lucide-react';
import type { MapMarker, OpenMeteoCurrentWeather } from '@/types';

interface MarkerPopupProps {
  marker: MapMarker;
  onFavoriteToggle?: (marker: MapMarker) => void;
}

// Display Popup for weather details
export default function MarkerPopup({
  marker,
  onFavoriteToggle,
}: MarkerPopupProps) {
  const [weather, setWeather] = useState<OpenMeteoCurrentWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch weather for this location when popup opens
  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${marker.lat}&longitude=${marker.lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m`
        );
        const data = await res.json();
        setWeather(data.current);
      } catch (err) {
        console.error('Failed to fetch weather:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [marker.lat, marker.lon]);

  // Get icon based on marker type
  const getTypeIcon = () => {
    switch (marker.type) {
      case 'favorite':
        return <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />;
      case 'history':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  // Format relative time
  const getRelativeTime = (date: string | undefined): string => {
    if (!date) return '';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleViewWeather = () => {
    // Navigate to weather page with this location pre-selected
    navigate(
      `/weather?lat=${marker.lat}&lon=${marker.lon}&name=${encodeURIComponent(marker.label)}&country=${encodeURIComponent(marker.country || '')}`
    );
  };

  return (
    <div className="min-w-[220px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            {getTypeIcon()}
            <h3 className="font-semibold text-base leading-tight">
              {marker.label}
            </h3>
          </div>
          {marker.country && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {marker.country}
            </p>
          )}
        </div>
      </div>

      {/* Weather */}
      {loading ? (
        <div className="space-y-2 py-2">
          <Skeleton className="h-8 w-20 mx-auto" />
          <Skeleton className="h-4 w-16 mx-auto" />
        </div>
      ) : weather ? (
        <div className="text-center py-2 border-y">
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl">
              {getWeatherIcon(weather.weather_code)}
            </span>
            <span
              className={`text-2xl font-bold ${getTempColor(weather.temperature_2m)}`}
            >
              {weather.temperature_2m?.toFixed(1)}°C
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getWeatherDescription(weather.weather_code)}
          </p>
          <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Wind className="h-3 w-3" />
              {weather.wind_speed_10m} km/h
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              {weather.relative_humidity_2m}%
            </span>
          </div>
        </div>
      ) : null}

      {/* Metadata */}
      <div className="text-xs text-muted-foreground mt-2">
        {marker.type === 'history' && marker.searchedAt && (
          <p>Searched {getRelativeTime(marker.searchedAt)}</p>
        )}
        {marker.type === 'favorite' && marker.addedAt && (
          <p>Added {getRelativeTime(marker.addedAt)}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 h-8 text-xs"
          onClick={handleViewWeather}
        >
          <Navigation className="h-3 w-3 mr-1" />
          View Details
        </Button>
        {marker.type !== 'favorite' && onFavoriteToggle && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => onFavoriteToggle(marker)}
          >
            <Star className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
