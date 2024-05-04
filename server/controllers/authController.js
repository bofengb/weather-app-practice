const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Import mongodb schema
const User = require("../models/User");

// Hash password using bcrypt
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

// Compare passwords using bcrypt
const comparePasswords = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Test endpoint
const testFunction = (req, res) => {
  res.json("Test successful");
};

// Register endpoint
const resigterUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check username
    if (!username) {
      return res.json({
        error: "Name is required.",
      });
    }

    // Check password
    if (!password) {
      return res.json({
        error: "Password is required.",
      });
    }

    // Check email
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.json({
        error: "Email is taken already.",
      });
    }

    // Create user in the database

    const hashedPassword = await hashPassword(password);

    const userInfo = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.json(userInfo);
  } catch (error) {
    res.status(422).json(error);
  }
};

// Login endpoint
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return res.json({
        error: "No user found.",
      });
    }

    // Check if passwords match
    const passwordMatch = await comparePasswords(password, userExist.password);
    if (passwordMatch) {
      // Assign a JSON web token (cookie) to the current user
      jwt.sign(
        {
          email: userExist.email,
          id: userExist._id,
          username: userExist.username,
        },
        process.env.JWT_SECRET,
        {},
        (err, token) => {
          if (err) {
            throw err;
          }
          res.cookie("token", token).json(userExist);
        }
      );
    } else {
      return res.json({
        error: "Passwords do not match.",
      });
    }
  } catch (error) {
    res.status(422).json(error);
  }
};

const getUserProfile = async (req, res) => {
  const { token } = req.cookies;

  // If there is a token in the cookie, we can get user inforamtion
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  } else {
    // If there is no token in the cookie, we return null.
    res.json(null);
  }
};

const logoutUser = async (req, res) => {
  // Reset cookie
  res.cookie("token", "").json(true);
};

module.exports = {
  testFunction,
  resigterUser,
  loginUser,
  getUserProfile,
  logoutUser,
};
