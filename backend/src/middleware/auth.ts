import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById, UserRecord } from '../lib/mock-data';

export type AuthedRequest = Request & {
  auth?: { sub: string; role: string; user?: UserRecord };
};

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header.' });
  }

  const token = header.slice('Bearer '.length).trim();
  const secret = process.env.JWT_SECRET ?? 'dev-secret';
  try {
    const payload = jwt.verify(token, secret) as { sub: string; role: string };
    const user = getUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }
    req.auth = { sub: payload.sub, role: payload.role, user };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.auth?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges are required for this action.' });
  }
  return next();
}

