import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lexifusion-dev-secret';

export interface JwtPayload {
  userId: string;
  deviceId: string;
}

/** Extend Express Request to carry authenticated user info */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/** Sign a JWT token */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

/** Verify a JWT token */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Auth middleware: requires a valid JWT in the Authorization header.
 * Sets req.user with { userId, deviceId }.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Optional auth: if token is present, decode it; otherwise continue without user.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7);
    try {
      req.user = verifyToken(token);
    } catch {
      // ignore invalid token, proceed without user
    }
  }
  next();
}
