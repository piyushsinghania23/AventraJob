import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  createUserRecord,
  getUserByEmail,
  getUserById,
  upsertGoogleUser,
} from '../lib/mock-data';

const router = Router();

const ALLOWED_ROLES = new Set(['candidate', 'recruiter', 'admin']);

function safeUser(user: { id: string; email: string; fullName: string; role: string; avatarUrl?: string }) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

function signSession(user: { id: string; role: string }) {
  return jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { email, password, fullName, role } = req.body as {
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
  };

  if (!email || !fullName) {
    return res.status(400).json({ message: 'Email and full name are required.' });
  }

  // If a password is provided, enforce minimum length. Otherwise the user
  // is expected to sign in via Google OAuth.
  if (password !== undefined && password !== null && password !== '') {
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
  }

  const desiredRole = role && ALLOWED_ROLES.has(role) ? role : 'candidate';

  const existing = getUserByEmail(email);
  if (existing) {
    if (existing.authProvider === 'google' && !password) {
      const token = signSession(existing);
      return res.status(200).json({ token, user: safeUser(existing) });
    }
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const user = await createUserRecord({
    email,
    password: password && password.length > 0 ? password : 'oauth-placeholder',
    fullName,
    role: desiredRole,
  });

  const token = signSession(user);

  res.status(201).json({ token, user: safeUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (user.authProvider === 'google') {
    return res.status(400).json({
      message: 'This account was created with Google. Please sign in with Google.',
    });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = signSession(user);
  res.json({ token, user: safeUser(user) });
});

/**
 * Google OAuth (mock-friendly) flow.
 *
 * The frontend collects a Google credential payload (idToken + profile) and
 * posts it here. In production this would be replaced by verifying the
 * Google `id_token` against Google's public keys. For this project we
 * accept any well-formed payload so the flow can be demonstrated end-to-end.
 */
router.post('/google', (req, res) => {
  const { credential, role } = req.body as {
    credential?: {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };
    role?: string;
  };

  if (!credential?.sub || !credential.email || !credential.name) {
    return res.status(400).json({ message: 'Invalid Google credential payload.' });
  }

  const desiredRole = role && ALLOWED_ROLES.has(role) ? role : 'candidate';

  const user = upsertGoogleUser({
    googleId: credential.sub,
    email: credential.email,
    fullName: credential.name,
    avatarUrl: credential.picture,
    role: desiredRole,
  });

  const token = signSession(user);
  res.json({ token, user: safeUser(user) });
});

router.get('/me', async (req, res) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing authorization header.' });
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'dev-secret') as { sub: string; role: string };
    const found = getUserById(payload.sub);
    if (!found) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({
      user: { id: found.id, email: found.email, fullName: found.fullName, role: found.role, isVerified: found.isVerified },
    });
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
});

router.post('/admin/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'This account is not authorized for the admin console.' });
  }

  const token = signSession(user);
  res.json({ token, user: safeUser(user) });
});

export default router;
