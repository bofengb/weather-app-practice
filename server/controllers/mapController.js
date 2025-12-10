const User = require('../models/User');
const SearchHistory = require('../models/SearchHistory');

const getMapData = async (req, res) => {
  try {
    const userId = req.user.id;
    const { includeHistory = 'true', limit = 50 } = req.query;

    // Promise.all runs queries in parallel: total time = max(query1, query2)
    const [user, recentHistory] = await Promise.all([
      User.findById(userId).select('favorites').lean(), // Plain JS, no Mongoose methods
      // Ternary returns either real query or Promise.resolve([]) as placeholder
      includeHistory === 'true'
        ? SearchHistory.find({ userId })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean()
        : Promise.resolve([]),
    ]);

    const markers = [
      // Favorites (yellow stars)
      ...user.favorites.map((f) => ({
        type: 'favorite',
        id: f._id.toString(),
        lat: f.lat,
        lon: f.lon,
        label: f.cityName,
        country: f.country,
        addedAt: f.addedAt,
      })),
      // Search history (gray dots)
      ...recentHistory.map((h) => ({
        type: 'history',
        id: h._id.toString(),
        lat: h.lat,
        lon: h.lon,
        label: h.cityName,
        country: h.country,
        temperature: h.temperature,
        searchedAt: h.createdAt,
      })),
    ];

    res.json({
      markers,
      counts: {
        favorites: user.favorites.length,
        history: recentHistory.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getMapData,
};
