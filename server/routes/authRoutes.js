const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', getUserProfile);
router.post('/logout', logoutUser);

module.exports = router;
