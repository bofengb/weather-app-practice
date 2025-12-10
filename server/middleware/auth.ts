import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '../types/index.js';

// Middleware
const auth = (req: Request, res: Response, next: NextFunction): void => {
  const { token } = req.cookies;

  if (!token) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    // Attach jwt payload (email, id, username) to req for downstream use
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export default auth;
