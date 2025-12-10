const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    // Attach jwt payload (email, id, username) to req for downstream use
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
