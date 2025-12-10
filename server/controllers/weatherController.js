const User = require('../models/User');
const SearchHistory = require('../models/SearchHistory');

const saveSearchHistory = async (req, res) => {
  try {
    const {
      cityName,
      country,
      lat,
      lon,
      temperature,
      feelsLike,
      humidity,
      windSpeed,
      weatherCondition,
      weatherIcon,
    } = req.body;

    if (!cityName || !lat || !lon) {
      return res.status(400).json({
        error: 'City name, latitude, and longitude are required.',
      });
    }

    // User isolation: req.user.id from verified JWT ensures user owns this data
    const searchHistory = await SearchHistory.create({
      userId: req.user.id,
      cityName,
      country,
      lat,
      lon,
      temperature,
      feelsLike,
      humidity,
      windSpeed,
      weatherCondition,
      weatherIcon,
    });

    res.json(searchHistory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSearchHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Server-side pagination: client only gets one page at a time
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder }; // Dynamic Key Access

    const history = await SearchHistory.find({ userId: req.user.id })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(); // Plain JS objects, no Mongoose overhead

    const total = await SearchHistory.countDocuments({ userId: req.user.id });

    res.json({
      history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSearchHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // User isolation: req.user.id from verified JWT ensures user owns this data
    const deleted = await SearchHistory.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ error: 'History item not found' });
    }

    res.json({ success: true, message: 'History item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Favorites are embedded in User doc. No separate collection.
const addFavorite = async (req, res) => {
  try {
    const { cityName, country, lat, lon } = req.body;

    if (!cityName || !lat || !lon) {
      return res.status(400).json({
        error: 'City name, latitude, and longitude are required.',
      });
    }

    const userDoc = await User.findById(req.user.id);

    const alreadyFavorited = userDoc.favorites.some(
      (fav) => fav.lat === lat && fav.lon === lon
    );

    if (alreadyFavorited) {
      return res.status(400).json({ error: 'City already in favorites' });
    }

    // Hard limit of 10
    if (userDoc.favorites.length >= 10) {
      return res.status(400).json({
        error: 'Maximum 10 favorites allowed. Please remove one first.',
      });
    }

    userDoc.favorites.push({
      cityName,
      country,
      lat,
      lon,
      addedAt: new Date(),
    });

    await userDoc.save();

    res.json({
      success: true,
      favorites: userDoc.favorites,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFavorites = async (req, res) => {
  try {
    const userDoc = await User.findById(req.user.id).select('favorites');
    res.json({ favorites: userDoc.favorites });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;

    const userDoc = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: { _id: id } } },
      { new: true }
    );

    if (!userDoc) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      favorites: userDoc.favorites,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStatistics = async (req, res) => {
  try {
    const stats = await SearchHistory.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null, // Group ALL matching docs into one bucket
          totalSearches: { $sum: 1 },
          avgTemperature: { $avg: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          minTemperature: { $min: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
        },
      },
    ]);

    const mostSearchedCities = await SearchHistory.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$cityName',
          count: { $sum: 1 },
          country: { $first: '$country' }, // Grabs from first doc in group
          lastSearched: { $max: '$createdAt' },
        },
      },
      { $sort: { count: -1 } }, // Descending by count
      { $limit: 5 },
    ]);

    const hottestSearch = await SearchHistory.findOne({ userId: req.user.id })
      .sort({ temperature: -1 })
      .limit(1);

    const coldestSearch = await SearchHistory.findOne({ userId: req.user.id })
      .sort({ temperature: 1 })
      .limit(1);

    res.json({
      overview: stats[0] || {
        totalSearches: 0,
        avgTemperature: 0,
        maxTemperature: 0,
        minTemperature: 0,
        avgHumidity: 0,
      },
      mostSearchedCities,
      extremes: {
        hottest: hottestSearch,
        coldest: coldestSearch,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  saveSearchHistory,
  getSearchHistory,
  deleteSearchHistory,
  addFavorite,
  getFavorites,
  removeFavorite,
  getStatistics,
};
