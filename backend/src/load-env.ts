import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db';
}

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret-change-me';
}
