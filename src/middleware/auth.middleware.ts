import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
}

// Extend Express Request
declare global {
  namespace Express {
    interface User extends AuthUser {}
  }
}

// Required authentication
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: AuthUser | false) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Authentication error' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    req.user = user;
    next();
  })(req, res, next);
};

// Optional authentication — attaches user if token present, but doesn't block
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: AuthUser | false) => {
    if (user) {
      req.user = user;
    }
    next();
  })(req, res, next);
};
