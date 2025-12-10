const express = require('express');
const auth = require('../middleware/auth');
const {
  saveSearchHistory,
  getSearchHistory,
  deleteSearchHistory,
  addFavorite,
  getFavorites,
  removeFavorite,
  getStatistics,
} = require('../controllers/weatherController');

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

module.exports = router;
