const express = require('express');
const auth = require('../middleware/auth');
const { getMapData } = require('../controllers/mapController');

const router = express.Router();

// All map routes require authentication
router.use(auth);

router.get('/data', getMapData);

module.exports = router;
