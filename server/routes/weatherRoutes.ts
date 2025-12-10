import express from 'express';
import auth from '../middleware/auth.js';
import {
  saveSearchHistory,
  getSearchHistory,
  deleteSearchHistory,
  addFavorite,
  getFavorites,
  removeFavorite,
  getStatistics,
} from '../controllers/weatherController.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Search History Routes
router.post('/history', saveSearchHistory);
router.get('/history', getSearchHistory);
router.delete('/history/:id', deleteSearchHistory);

// Favorites Routes
router.post('/favorites', addFavorite);
router.get('/favorites', getFavorites);
router.delete('/favorites/:id', removeFavorite);

// Statistics Route
router.get('/statistics', getStatistics);

export default router;
