/**
 * Prisma Client Singleton
 * Ensures a single database connection is reused across the application
 * Based on nextjs-best-practices@1.0.0
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
