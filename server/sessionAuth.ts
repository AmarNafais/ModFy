import session from 'express-session';
import MemoryStore from 'memorystore';

const MemStoreSession = MemoryStore(session);

export const sessionConfig = session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
  store: new MemStoreSession({
    checkPeriod: 86400000, // Clean up expired entries every 24h
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

// Type augmentation for session
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
  }
}

// Middleware to check if user is authenticated
export function requireAuth(req: any, res: any, next: any) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// Middleware to add user info to request
export function addUserToRequest(req: any, res: any, next: any) {
  if (req.session.userId) {
    req.userId = req.session.userId;
    req.user = req.session.user;
  }
  next();
}