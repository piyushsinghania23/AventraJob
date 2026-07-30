import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUserRecord, getUserByEmail, getUserById } from '../lib/mock-data';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, fullName, role } = req.body as {
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
  };

  if (!email || !password || !fullName) {
    return res.status(400).json({ message: 'Email, password, and full name are required.' });
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'User already exists.' });
  }

  const user = await createUserRecord({ email, password, fullName, role });
  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '7d' });

  res.status(201).json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
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

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '7d' });

  res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
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

  const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET ?? 'dev-secret', { expiresIn: '7d' });

  res.json({ token, user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role } });
});

export default router;
