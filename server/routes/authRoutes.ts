import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  updateProfile,
  changePassword,
} from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.post('/logout', logoutUser);
router.patch('/profile', auth, updateProfile);
router.patch('/password', auth, changePassword);

export default router;
