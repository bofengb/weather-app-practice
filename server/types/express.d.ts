// extend Express Request to include user from JWT
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        iat?: number;
        exp?: number;
      };
    }
  }
}

export {};
