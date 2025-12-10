const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

const comparePasswords = (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

const cookieOptions = {
  httpOnly: true, // JS can't access (XSS protection)
  secure: false, // HTTPS only
  sameSite: 'lax', // Blocks cross-site POST (CSRF protection)
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: 'Password must be at least 6 characters.' });
    }

    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return res.status(400).json({ error: 'Email is taken already.' });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { email: user.email, id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.cookie('token', token, cookieOptions).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

const getUserProfile = async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json(null);
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json(user);
  } catch (err) {
    res.json(null);
  }
};

// Clear cookie
const logoutUser = async (req, res) => {
  res
    .cookie('token', '', { ...cookieOptions, maxAge: 0 })
    .json({ success: true });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
};
