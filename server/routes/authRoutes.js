const express = require("express");
const cores = require("cors");
const {
  testFunction,
  resigterUser,
  loginUser,
  getUserProfile,
  logoutUser,
} = require("../controllers/authController");

// Initialize express router
const router = express.Router();

router.use(
  cores({
    credentials: true,
    origin: process.env.CORS_ORIGIN_URL,
  })
);

// Test route
router.get("/", testFunction);

// Registration route
router.post("/register", resigterUser);

// Login route
router.post("/login", loginUser);

// Get profile
router.get("/profile", getUserProfile);

// Logout route
router.post("/logout", logoutUser);

module.exports = router;
