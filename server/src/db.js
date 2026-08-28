import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// A single shared Prisma Client for the whole server.
// `dotenv/config` (imported above) loads DATABASE_URL from .env into
// process.env before the client is created.
export const prisma = new PrismaClient();
