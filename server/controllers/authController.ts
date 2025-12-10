import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import type {
  RegisterRequest,
  LoginRequest,
  JWTPayload,
} from '../types/index.js';

const hashPassword = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

const comparePasswords = (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

const cookieOptions = {
  httpOnly: true, // JS can't access (XSS protection)
  secure: false, // HTTPS only
  sameSite: 'lax' as const, // Blocks cross-site POST (CSRF protection)
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerUser = async (
  req: Request<{}, {}, RegisterRequest>,
  res: Response
): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    if (!username) {
      res.status(400).json({ error: 'Name is required.' });
      return;
    }

    if (!password || password.length < 6) {
      res
        .status(400)
        .json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const emailExist = await User.findOne({ email });
    if (emailExist) {
      res.status(400).json({ error: 'Email is taken already.' });
      return;
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

export const loginUser = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials.' });
      return;
    }

    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      res.status(400).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign(
      { email: user.email, id: user._id.toString(), username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.cookie('token', token, cookieOptions).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.cookies;

  if (!token) {
    res.json(null);
    return;
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    res.json(user);
  } catch (err) {
    res.json(null);
  }
};

// Clear cookie
export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  res
    .cookie('token', '', { ...cookieOptions, maxAge: 0 })
    .json({ success: true });
};
