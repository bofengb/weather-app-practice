import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useFavorites from '@/hooks/useFavorites';
import useSearchHistory from '@/hooks/useSearchHistory';
import useDebounce from '@/hooks/useDebounce';
import { getWeatherDescription, getWeatherIcon } from '@/lib/weather';
import {
  Star,
  Wind,
  Thermometer,
  Droplets,
  Map as MapIcon,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Weather() {
  const [searchQuery, setSearchQuery] = useState('');
  const [geoData, setGeoData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [showSearch, setShowSearch] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Two states: searchQuery (immediate) vs debouncedSearch (delayed 500ms)
  // Avoids API call on every keystroke while feeling responsive
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { saveSearch } = useSearchHistory();
  const {
    isFavorited,
    getFavoriteId,
    addFavorite,
    removeFavorite,
    canAddMore,
  } = useFavorites();

  // Deep linking via URL params
  const handleViewOnMap = () => {
    if (currentLocation) {
      navigate(`/map?lat=${currentLocation.lat}&lon=${currentLocation.lon}`);
    }
  };

  // Fetch city suggestions when debounced search changes
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setGeoData(null);
      return;
    }

    const fetchCities = async () => {
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(debouncedSearch)}&count=5&language=en&format=json`
        );

        if (!res.ok) {
          toast.error('Failed to search cities');
          return;
        }

        const data = await res.json();
        setGeoData(data.results || null);
      } catch (error) {
        toast.error('Search failed');
      }
    };

    fetchCities();
  }, [debouncedSearch]);

  // Handle incoming URL params (e.g., from Map's "View Details" link)
  // Only runs once on mount
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const name = searchParams.get('name');
    const country = searchParams.get('country') || '';

    if (lat && lon && name) {
      handleCitySelect(parseFloat(lat), parseFloat(lon), name, country);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCitySelect = async (lat, lon, name, country = '') => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!res.ok) {
        toast.error('Failed to fetch weather data');
        return;
      }

      const data = await res.json();
      const current = data.current;
      const weatherCode = current.weather_code;

      const weather = {
        temp: current.temperature_2m,
        feelsLike: current.apparent_temperature,
        humidity: current.relative_humidity_2m,
        wind: current.wind_speed_10m,
        icon: getWeatherIcon(weatherCode),
        condition: getWeatherDescription(weatherCode),
        name,
        country,
        lat,
        lon,
      };

      setWeatherData(weather);
      setCurrentLocation({ lat, lon, name, country });
      setShowSearch(false);
      setSearchQuery('');
      setGeoData(null);

      try {
        await saveSearch({
          cityName: name,
          country,
          lat,
          lon,
          temperature: weather.temp,
          feelsLike: weather.feelsLike,
          humidity: weather.humidity,
          windSpeed: weather.wind,
          weatherCondition: weather.condition,
          weatherIcon: String(weatherCode),
        });
      } catch (err) {
        // Error
      }
    } catch (error) {
      toast.error('Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!currentLocation) return;

    const { lat, lon, name, country } = currentLocation;
    const favorited = isFavorited(lat, lon);

    try {
      if (favorited) {
        const favoriteId = getFavoriteId(lat, lon);
        await removeFavorite(favoriteId);
        toast.success(`${name} removed from favorites`);
      } else {
        if (!canAddMore) {
          toast.error('Maximum 10 favorites allowed');
          return;
        }
        await addFavorite({ cityName: name, country, lat, lon });
        toast.success(`${name} added to favorites`);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update favorites');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {showSearch ? (
            <div className="space-y-4 pt-12">
              <h1 className="text-2xl font-bold text-center mb-8">
                Search Weather
              </h1>
              <Input
                type="text"
                placeholder="Search for a city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg h-12"
              />

              {geoData && geoData.length > 0 && (
                <Card>
                  <CardContent className="p-2">
                    {geoData.map((city, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          handleCitySelect(
                            city.latitude,
                            city.longitude,
                            city.name,
                            city.country
                          )
                        }
                        className="w-full text-left px-4 py-3 hover:bg-accent rounded-md transition-colors"
                      >
                        <span className="font-medium">{city.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {city.country}
                        </span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {isLoading && (
                <div className="space-y-4 mt-8">
                  <Skeleton className="h-32 w-32 mx-auto rounded-full" />
                  <Skeleton className="h-8 w-24 mx-auto" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6 pt-8">
              <div className="text-8xl">{weatherData?.icon}</div>

              <div>
                <h1 className="text-6xl font-bold">
                  {weatherData?.temp?.toFixed(1)}°C
                </h1>
                <p className="text-muted-foreground mt-1">
                  {weatherData?.condition}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-semibold text-primary">
                  {weatherData?.name}
                </h2>
                <button
                  onClick={handleFavoriteToggle}
                  className="text-2xl hover:scale-110 transition-transform"
                  title={
                    currentLocation &&
                    isFavorited(currentLocation.lat, currentLocation.lon)
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                >
                  {currentLocation &&
                  isFavorited(currentLocation.lat, currentLocation.lon) ? (
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <Star className="h-6 w-6 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setShowSearch(true)}>
                  Change City
                </Button>
                <Button variant="outline" onClick={handleViewOnMap}>
                  <MapIcon className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wind className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{weatherData?.wind}</p>
                    <p className="text-xs text-muted-foreground">km/h</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Thermometer className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">
                      {weatherData?.feelsLike}
                    </p>
                    <p className="text-xs text-muted-foreground">Feels like</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Droplets className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">
                      {weatherData?.humidity}
                    </p>
                    <p className="text-xs text-muted-foreground">Humidity %</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
