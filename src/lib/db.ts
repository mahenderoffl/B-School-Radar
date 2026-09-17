import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import path from "node:path";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// TURSO_DATABASE_URL/TURSO_AUTH_TOKEN point at a Turso database in production.
// Locally, with those unset, this falls back to the same SQLite file Prisma
// Migrate uses (prisma/dev.db) — no Turso account needed for local dev.
const adapter = new PrismaLibSQL({
  url: process.env.TURSO_DATABASE_URL ?? `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
