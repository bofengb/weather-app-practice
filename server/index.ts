import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import mapRoutes from './routes/mapRoutes.js';

const app = express();

// Middleware order matters
// helmet first for security headers (CSP, X-Frame-Options, etc.)
app.use(helmet());

// Only rate-limiting auth routes. They're the brute-force target.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Parses cookies into req.cookies
app.use(
  cors({
    credentials: true, // Allow cookies to be sent cross-origin
    origin: process.env.CORS_ORIGIN_URL,
  })
);

mongoose
  .connect(process.env.MONGODB_URL!)
  .then(() => console.log('DB connected'))
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });

// Health check
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
// AuthLimiter only on auth
// Protected routes are handled by JWT
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1', weatherRoutes);
app.use('/api/v1/map', mapRoutes);

// Error handler
// (1) Must be last. (2) Must has 4-param signature to tell Express it handles errors
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server is running on port ${port}`));

// Export for Vercel serverless
export default app;
