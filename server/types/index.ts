import { Types, Document } from 'mongoose';

// JWT payload attached to req.user
export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

// Favorite subdocument (embedded in User)
export interface IFavorite {
  _id?: Types.ObjectId;
  cityName: string;
  country?: string;
  lat: number;
  lon: number;
  addedAt: Date;
}

// User document interface
export interface IUser {
  username: string;
  email: string;
  password: string;
  favorites: IFavorite[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
}

// SearchHistory document interface
export interface ISearchHistory {
  userId: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ISearchHistoryDocument extends ISearchHistory, Document {
  _id: Types.ObjectId;
  searchAge: number; // virtual property
}

// API request/response types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SaveSearchRequest {
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

export interface AddFavoriteRequest {
  cityName: string;
  country?: string;
  lat: number;
  lon: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface HistoryQueryParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MapQueryParams {
  includeHistory?: string;
  limit?: string;
}

// Map marker types
export interface FavoriteMarker {
  type: 'favorite';
  id: string;
  lat: number;
  lon: number;
  label: string;
  country?: string;
  addedAt: Date;
}

export interface HistoryMarker {
  type: 'history';
  id: string;
  lat: number;
  lon: number;
  label: string;
  country?: string;
  temperature?: number;
  searchedAt: Date;
}

export type MapMarker = FavoriteMarker | HistoryMarker;

// Statistics types
export interface StatisticsOverview {
  totalSearches: number;
  avgTemperature: number | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  avgHumidity: number | null;
}

export interface MostSearchedCity {
  _id: string;
  count: number;
  country?: string;
  lastSearched: Date;
}

export interface StatisticsResponse {
  overview: StatisticsOverview;
  mostSearchedCities: MostSearchedCity[];
  extremes: {
    hottest: ISearchHistory | null;
    coldest: ISearchHistory | null;
  };
}
