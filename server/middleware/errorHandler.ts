import { Request, Response, NextFunction } from 'express';

interface MongooseError extends Error {
  name: string;
}

const errorHandler = (
  err: MongooseError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({ error: 'Invalid ID format' });
    return;
  }

  res.status(500).json({ error: 'Something went wrong' });
};

export default errorHandler;
