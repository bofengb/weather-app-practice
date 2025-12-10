import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useFavorites from '@/hooks/useFavorites';
import {
  getWeatherDescription,
  getWeatherIcon,
  getTempColor,
} from '@/lib/weather';
import {
  RefreshCw,
  X,
  Wind,
  Droplets,
  Gauge,
  Map as MapIcon,
} from 'lucide-react';
import type { OpenMeteoCurrentWeather } from '@/types';

interface WeatherResult {
  id: string;
  current?: OpenMeteoCurrentWeather;
  success: boolean;
}

export default function Favorites() {
  const { favorites, loading, removeFavorite } = useFavorites();
  const [weatherData, setWeatherData] = useState<
    Record<string, OpenMeteoCurrentWeather>
  >({});
  const [loadingWeather, setLoadingWeather] = useState(false);
  const navigate = useNavigate();

  // Fetch weather for all favorites in parallel
  const fetchAllWeather = useCallback(async () => {
    if (favorites.length === 0) return;

    setLoadingWeather(true);
    try {
      // Promise.all with individual .catch(). One failure won't crash others
      const results: WeatherResult[] = await Promise.all(
        favorites.map((fav) =>
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${fav.lat}&longitude=${fav.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl&timezone=auto`
          )
            .then((res) => res.json())
            .then((data) => ({
              id: fav._id,
              current: data.current as OpenMeteoCurrentWeather,
              success: true,
            }))
            .catch(() => ({ id: fav._id, success: false }))
        )
      );

      // Build weatherMap object for O(1) lookup by ID
      const weatherMap: Record<string, OpenMeteoCurrentWeather> = {};
      results.forEach((result) => {
        if (result.success && result.current) {
          weatherMap[result.id] = result.current;
        }
      });
      setWeatherData(weatherMap);
    } catch (error) {
      toast.error('Failed to fetch weather data');
    } finally {
      setLoadingWeather(false);
    }
  }, [favorites]);

  useEffect(() => {
    fetchAllWeather();
  }, [fetchAllWeather]);

  const handleRemove = async (id: string, cityName: string) => {
    if (window.confirm(`Remove ${cityName} from favorites?`)) {
      try {
        await removeFavorite(id);
        toast.success(`${cityName} removed`);
      } catch (error) {
        toast.error('Failed to remove');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            Favorites{' '}
            <span className="text-muted-foreground text-xl">
              ({favorites.length}/10)
            </span>
          </h1>
          <Button
            variant="outline"
            onClick={fetchAllWeather}
            disabled={loadingWeather || favorites.length === 0}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loadingWeather ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No favorite cities yet.
              </p>
              <Link to="/weather" className="text-primary hover:underline">
                Search for cities and add them to favorites
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((fav) => {
                const weather = weatherData[fav._id];
                const isLoading = loadingWeather && !weather;

                return (
                  <Card key={fav._id} className="relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          navigate(`/map?lat=${fav.lat}&lon=${fav.lon}`)
                        }
                        title="View on map"
                      >
                        <MapIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemove(fav._id, fav.cityName)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h2 className="text-xl font-bold">{fav.cityName}</h2>
                        <p className="text-sm text-muted-foreground">
                          {fav.country}
                        </p>
                      </div>

                      {isLoading ? (
                        <div className="space-y-4 py-4">
                          <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                          <Skeleton className="h-8 w-20 mx-auto" />
                          <Skeleton className="h-4 w-24 mx-auto" />
                        </div>
                      ) : weather ? (
                        <>
                          <div className="text-center mb-4">
                            <div className="text-6xl mb-2">
                              {getWeatherIcon(weather.weather_code)}
                            </div>
                            <div
                              className={`text-4xl font-bold ${getTempColor(weather.temperature_2m)}`}
                            >
                              {weather.temperature_2m.toFixed(1)}°C
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Feels like{' '}
                              {weather.apparent_temperature.toFixed(1)}°C
                            </p>
                            <p className="text-sm font-medium mt-2">
                              {getWeatherDescription(weather.weather_code)}
                            </p>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                            <div className="text-center">
                              <Droplets className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-sm font-medium">
                                {weather.relative_humidity_2m}%
                              </p>
                            </div>
                            <div className="text-center">
                              <Wind className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-sm font-medium">
                                {weather.wind_speed_10m.toFixed(0)} km/h
                              </p>
                            </div>
                            <div className="text-center">
                              <Gauge className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-sm font-medium">
                                {weather.pressure_msl?.toFixed(0)} hPa
                              </p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="py-8 text-center text-destructive">
                          Failed to load weather
                        </div>
                      )}

                      <p className="text-center text-xs text-muted-foreground mt-4">
                        Added {new Date(fav.addedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {favorites.length < 10 && (
              <div className="mt-8 text-center">
                <Link to="/weather">
                  <Button variant="outline">
                    Add More ({10 - favorites.length} slots remaining)
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
