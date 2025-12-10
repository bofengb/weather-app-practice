# Weather App

A full-stack weather application built with the MERN stack (MongoDB, Express, React, Node.js). Users can search for weather conditions worldwide, save favorites, view search history, and visualize locations on an interactive map.

## Features

- **Authentication**: Register/login with JWT stored in httpOnly cookies
- **Weather Search**: City autocomplete with debounced search, current weather display
- **Favorites**: Save up to 10 favorite cities with quick access
- **Search History**: Paginated, sortable history of past searches
- **Interactive Map**: Leaflet-based map showing favorites and search history markers

## Tech Stack

### Frontend
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
- Express.js
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
  index.js                    # Express app setup, middleware, routes
  /middleware
    auth.js                   # JWT verification middleware
    errorHandler.js           # Centralized error handling
  /controllers
    authController.js         # register, login, logout, profile
    weatherController.js      # history CRUD, favorites CRUD, statistics
    mapController.js          # combined map data endpoint
  /models
    User.js                   # User schema with embedded favorites
    SearchHistory.js          # Search history schema
  /routes
    authRoutes.js             # /api/v1/auth/*
    weatherRoutes.js          # /api/v1/history, /api/v1/favorites, /api/v1/statistics
    mapRoutes.js              # /api/v1/map/data

/client/src
  App.jsx                     # Routes, axios config, context provider
  main.jsx                    # React entry point
  index.css                   # Tailwind imports
  /context
    UserContext.jsx           # Auth state: { user, setUser, ready }
  /hooks
    useFavorites.jsx          # Favorites CRUD with optimistic updates
    useSearchHistory.jsx      # History with pagination and sorting
    useMapData.jsx            # Combined map markers fetch
    useDebounce.jsx           # Debounce hook (500ms default)
  /pages
    Login.jsx                 # Login form with Zod validation
    Register.jsx              # Registration form
    Weather.jsx               # Search + weather display + favorite toggle
    History.jsx               # Paginated history table
    Favorites.jsx             # Favorites grid with live weather
    Map.jsx                   # Interactive Leaflet map
  /components
    Header.jsx                # Navigation + user info + logout
    ProtectedRoute.jsx        # Auth guard with loading state
    /ui                       # shadcn components
    /map                      # Map components (WeatherMap, MarkerPopup, MapControls, MapLegend)
  /lib
    utils.js                  # cn() for Tailwind class merging
    weather.js                # WMO weather codes to descriptions/icons
    validations.js            # Zod schemas for forms
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
node index.js
# or with hot reload
npx nodemon index.js
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
```javascript
{
  username: String,       // 2-50 chars
  email: String,          // unique, lowercase
  password: String,       // hashed, min 6 chars
  favorites: [{           // max 10 items
    cityName: String,
    country: String,
    lat: Number,
    lon: Number,
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### SearchHistory
```javascript
{
  userId: ObjectId,       // ref to User
  cityName: String,
  country: String,
  lat: Number,
  lon: Number,
  temperature: Number,
  feelsLike: Number,
  humidity: Number,
  windSpeed: Number,
  weatherCondition: String,
  weatherIcon: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Security

- JWT tokens stored in httpOnly cookies (XSS protection)
- Passwords hashed with bcrypt (10 salt rounds)
- Helmet middleware for security headers
- Rate limiting on auth routes (100 req/15 min)
- CORS restricted to frontend origin
- Request body size limited to 10kb

## Custom Hooks

### useFavorites
```javascript
const {
  favorites,           // Array of favorite cities
  loading,             // Boolean
  error,               // Error message or null
  favoritesCount,      // Number
  canAddMore,          // Boolean (< 10)
  addFavorite,         // async (cityData) => void
  removeFavorite,      // async (id) => void
  isFavorited,         // (lat, lon) => boolean
  getFavoriteId,       // (lat, lon) => string | undefined
} = useFavorites();
```

### useSearchHistory
```javascript
const {
  history,             // Array of search entries
  loading,             // Boolean
  error,               // Error message or null
  pagination,          // { page, limit, total, pages }
  fetchHistory,        // async (page, sortBy, sortOrder) => void
  saveSearch,          // async (searchData) => void
  deleteHistory,       // async (id) => void
} = useSearchHistory();
```

### useMapData
```javascript
const {
  markers,             // Array of map markers
  counts,              // { favorites, history }
  loading,             // Boolean
  error,               // Error message or null
  refetch,             // async () => void
} = useMapData({ includeHistory: true, historyLimit: 50 });
```

## Build

### Client Production Build
```bash
cd client
npm run build
```

### Server Deployment
The server exports the Express app for Vercel serverless deployment. See `server/vercel.json` for configuration.

## License

This repository is for learning purposes only.
