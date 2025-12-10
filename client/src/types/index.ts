// User and Auth types
export interface User {
  _id: string;
  username: string;
  email: string;
  favorites?: Favorite[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Favorite types
export interface Favorite {
  _id: string;
  cityName: string;
  country?: string;
  lat: number;
  lon: number;
  addedAt: string;
}

export interface FavoriteInput {
  cityName: string;
  country?: string;
  lat: number;
  lon: number;
}

// SearchHistory types
export interface SearchHistory {
  _id: string;
  userId: string;
  cityName: string;
  country?: string;
  lat: number;
  lon: number;
  temperature?: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  weatherCondition?: string;
  weatherIcon?: string;
  createdAt: string;
  updatedAt: string;
  searchAge?: number;
}

export interface SearchHistoryInput {
  cityName: string;
  country?: string;
  lat: number;
  lon: number;
  temperature?: number;
  feelsLike?: number;
  humidity?: number;
  windSpeed?: number;
  weatherCondition?: string;
  weatherIcon?: string;
}

// Pagination
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Map types
export interface MapMarker {
  type: 'favorite' | 'history';
  id: string;
  lat: number;
  lon: number;
  label: string;
  cityName?: string;
  country?: string;
  temperature?: number;
  addedAt?: string;
  searchedAt?: string;
}

export interface MapFilters {
  showFavorites: boolean;
  showHistory: boolean;
}

export interface MapCounts {
  favorites: number;
  history: number;
}

// Weather display types
export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  icon: string;
  condition: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface CurrentLocation {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

// Open-Meteo API response types
export interface GeoCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
}

export interface OpenMeteoGeoResponse {
  results?: GeoCity[];
}

export interface OpenMeteoCurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
  pressure_msl?: number;
}

export interface OpenMeteoWeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current: OpenMeteoCurrentWeather;
}

// API response types
export interface ApiError {
  error: string;
}

export interface FavoritesResponse {
  favorites: Favorite[];
  success?: boolean;
}

export interface HistoryResponse {
  history: SearchHistory[];
  pagination: Pagination;
}

export interface MapDataResponse {
  markers: MapMarker[];
  counts: MapCounts;
}

// Hook return types
export interface UseFavoritesReturn {
  favorites: Favorite[];
  loading: boolean;
  error: string | null;
  favoritesCount: number;
  canAddMore: boolean;
  fetchFavorites: () => Promise<void>;
  addFavorite: (cityData: FavoriteInput) => Promise<FavoritesResponse>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorited: (lat: number, lon: number) => boolean;
  getFavoriteId: (lat: number, lon: number) => string | undefined;
}

export interface UseSearchHistoryReturn {
  history: SearchHistory[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  fetchHistory: (
    page?: number,
    sortBy?: string,
    sortOrder?: string
  ) => Promise<void>;
  saveSearch: (searchData: SearchHistoryInput) => Promise<SearchHistory>;
  deleteHistory: (id: string) => Promise<void>;
}

export interface UseMapDataOptions {
  includeHistory?: boolean;
  historyLimit?: number;
}

export interface UseMapDataReturn {
  markers: MapMarker[];
  counts: MapCounts;
  loading: boolean;
  error: string | null;
  refetch: (isInitial?: boolean) => Promise<void>;
}

// Context types
export interface UserContextType {
  user: JWTPayload | null;
  setUser: React.Dispatch<React.SetStateAction<JWTPayload | null>>;
  ready: boolean;
}
