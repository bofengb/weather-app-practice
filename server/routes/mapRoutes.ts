import express from 'express';
import auth from '../middleware/auth.js';
import { getMapData } from '../controllers/mapController.js';

const router = express.Router();

// All map routes require authentication
router.use(auth);

router.get('/data', getMapData);

export default router;
