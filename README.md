# Weather App

A full-stack weather application built with the MERN stack (MongoDB, Express, React, Node.js) using **TypeScript**. Users can search for weather conditions worldwide, save favorites, view search history, and visualize locations on an interactive map.

**Live Demo**: [weather-app-practice-urpb.vercel.app](https://weather-app-practice-urpb.vercel.app)

## Features

- **Authentication**: Register/login with JWT stored in httpOnly cookies
- **User Settings**: Profile editing (username) and password change via modal dialog
- **Weather Search**: City autocomplete with debounced search, current weather display
- **Favorites**: Save up to 10 favorite cities with quick access
- **Search History**: Paginated, sortable history of past searches
- **Interactive Map**: Leaflet-based map showing favorites and search history markers

## Tech Stack

### Frontend
- TypeScript with strict mode
- React 18 with Vite
- React Router 6 for navigation
- Tailwind CSS for styling
- shadcn/ui components (Button, Card, Input, Label, Skeleton)
- React Hook Form + Zod for form validation
- Leaflet + React-Leaflet for maps
- Axios for API requests
- React Hot Toast for notifications
- Lucide React for icons

### Backend
- TypeScript with strict mode (ES2020 target)
- Express.js with tsx (dev runner)
- MongoDB with Mongoose ODM
- JWT for authentication
- bcrypt for password hashing
- Helmet for security headers
- express-rate-limit for rate limiting
- cookie-parser for cookie handling

### External APIs
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) - City search
- [Open-Meteo Weather API](https://open-meteo.com/en/docs) - Weather data (no API key required)

### Code Formatting
- Prettier configured in both `/client` and `/server`
- Settings: single quotes, semicolons, 2-space tabs, trailing commas (ES5), 80 char line width

## Project Structure

```
/server
  index.ts                    # Express app setup, middleware, routes
  /types
    index.ts                  # Shared types: IUser, ISearchHistory, API types
    express.d.ts              # Express Request augmentation for req.user
  /middleware
    auth.ts                   # JWT verification middleware
    errorHandler.ts           # Centralized error handling
  /controllers
    authController.ts         # register, login, logout, profile, updateProfile, changePassword
    weatherController.ts      # history CRUD, favorites CRUD, statistics
    mapController.ts          # combined map data endpoint
  /models
    User.ts                   # User schema with embedded favorites
    SearchHistory.ts          # Search history schema
  /routes
    authRoutes.ts             # /api/v1/auth/*
    weatherRoutes.ts          # /api/v1/history, /api/v1/favorites, /api/v1/statistics
    mapRoutes.ts              # /api/v1/map/data

/client/src
  App.tsx                     # Routes, axios config, context provider
  main.tsx                    # React entry point
  index.css                   # Tailwind imports
  /types
    index.ts                  # All frontend types: User, Favorite, hooks, API
  /context
    UserContext.tsx           # Auth state: { user, setUser, ready }
  /hooks
    useFavorites.ts           # Favorites CRUD with optimistic updates
    useSearchHistory.ts       # History with pagination and sorting
    useMapData.ts             # Combined map markers fetch
    useDebounce.ts            # Debounce hook (500ms default)
  /pages
    Login.tsx                 # Login form with Zod validation
    Register.tsx              # Registration form
    Weather.tsx               # Search + weather display + favorite toggle
    History.tsx               # Paginated history table
    Favorites.tsx             # Favorites grid with live weather
    Map.tsx                   # Interactive Leaflet map
  /components
    Header.tsx                # Navigation + avatar + logout
    Avatar.tsx                # Deterministic color avatar from username
    SettingsDialog.tsx        # Profile/password settings modal (tabbed)
    ProtectedRoute.tsx        # Auth guard with loading state
    /ui                       # shadcn components (includes Dialog)
    /map                      # Map components (WeatherMap, MarkerPopup, MapControls, MapLegend)
  /lib
    utils.ts                  # cn() for Tailwind class merging
    weather.ts                # WMO weather codes to descriptions/icons
    validations.ts            # Zod schemas for forms (login, register, profile, password)
```

## API Endpoints

### Auth Routes (`/api/v1/auth`)
Rate limited: 100 requests per 15 minutes

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| POST | `/register` | `{username, email, password}` | Create new user |
| POST | `/login` | `{email, password}` | Login, returns JWT cookie |
| POST | `/logout` | - | Clear JWT cookie |
| GET | `/profile` | - | Get current user from token |
| PATCH | `/profile` | `{username}` | Update username (auth required) |
| PATCH | `/password` | `{currentPassword, newPassword}` | Change password (auth required) |

### Protected Routes (require authentication)

**History (`/api/v1/history`)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get paginated history (`?page=1&limit=20&sortBy=createdAt&sortOrder=desc`) |
| POST | `/` | Save new search |
| DELETE | `/:id` | Delete history entry |

**Favorites (`/api/v1/favorites`)**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Get all favorites |
| POST | `/` | Add favorite (max 10) |
| DELETE | `/:id` | Remove favorite |

**Other**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/statistics` | Aggregated weather stats |
| GET | `/api/v1/map/data` | Combined favorites + history markers |
| GET | `/api/v1/health` | Health check |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Server Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGODB_URL=mongodb+srv://...
CORS_ORIGIN_URL=http://localhost:5173
JWT_SECRET=your-secret-key
PORT=4000
```

4. Start the server:
```bash
npm run dev
# or for production
npm run build && npm run start
```

### Client Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:4000
```

4. Start the development server:
```bash
npm run dev
```

5. Open http://localhost:5173

## Database Schema

### User
```typescript
interface IUser {
  username: string;       // 2-50 chars
  email: string;          // unique, lowercase
  password: string;       // hashed, min 6 chars
  favorites: IFavorite[]; // max 10 items
  createdAt: Date;
  updatedAt: Date;
}

interface IFavorite {
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  addedAt: Date;
}
```

### SearchHistory
```typescript
interface ISearchHistory {
  userId: ObjectId;       // ref to User
  cityName: string;
  country: string;
  lat: number;
  lon: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCondition: string;
  weatherIcon: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security

- JWT tokens stored in httpOnly cookies (XSS protection)
- Passwords hashed with bcrypt (10 salt rounds)
- Helmet middleware for security headers
- Rate limiting on auth routes (100 req/15 min)
- CORS restricted to frontend origin
- Request body size limited to 10kb

## Testing

### E2E Tests (Playwright)

End-to-end tests are located in `client/e2e/` and run against a real browser using Playwright.

```bash
# Run E2E tests locally
cd client
npm run test:e2e

# Run with interactive UI
npm run test:e2e:ui
```

**Configuration** (`client/playwright.config.ts`):
- Test directory: `./e2e`
- Browser: Chromium only
- Base URL: `http://localhost:5173`
- Retries: 2 in CI, 0 locally
- Auto-starts dev server if not running

**Test files**:
- `auth.spec.ts` - Authentication flows (login, register)
- `favorites.spec.ts` - Favorites functionality

## CI/CD

GitHub Actions workflows run on push/PR:

| Workflow | Triggers | Steps |
|----------|----------|-------|
| Client CI | `client/**` changes | Install → Lint → Format check → Build |
| Server CI | `server/**` changes | Install → Lint → Format check → Build |
| E2E Tests | All push/PR | Start MongoDB → Start server → Run Playwright tests |

All workflows use Node.js 20 on `ubuntu-latest`. E2E workflow spins up MongoDB 7 as a service and uploads test reports as artifacts.

## Custom Hooks

### useFavorites
```typescript
const {
  favorites,           // Favorite[]
  loading,             // boolean
  error,               // string | null
  favoritesCount,      // number
  canAddMore,          // boolean (< 10)
  addFavorite,         // (cityData: FavoriteInput) => Promise<void>
  removeFavorite,      // (id: string) => Promise<void>
  isFavorited,         // (lat: number, lon: number) => boolean
  getFavoriteId,       // (lat: number, lon: number) => string | undefined
}: UseFavoritesReturn = useFavorites();
```

### useSearchHistory
```typescript
const {
  history,             // SearchHistory[]
  loading,             // boolean
  error,               // string | null
  pagination,          // Pagination { page, limit, total, pages }
  fetchHistory,        // (page?, sortBy?, sortOrder?) => Promise<void>
  saveSearch,          // (data: SearchHistoryInput) => Promise<SearchHistory>
  deleteHistory,       // (id: string) => Promise<void>
}: UseSearchHistoryReturn = useSearchHistory();
```

### useMapData
```typescript
const {
  markers,             // MapMarker[]
  counts,              // MapCounts { favorites, history }
  loading,             // boolean
  error,               // string | null
  refetch,             // (isInitial?: boolean) => Promise<void>
}: UseMapDataReturn = useMapData({ includeHistory: true, historyLimit: 50 });
```

## Build

### Client Production Build
```bash
cd client
npm run build
```

### Server Production Build
```bash
cd server
npm run build
npm run start
```
