import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

// Special handler for Vercel Serverless environment to support read-write SQLite
// (only relevant if NOT using Turso — keep as a fallback, but with Turso configured
// this branch should no longer trigger since DATABASE_URL will be a libsql:// URL)
if (process.env.VERCEL && !databaseUrl.startsWith("libsql://")) {
  const tempDbPath = "/tmp/dev.db";
  const bundledDbPath = path.join(process.cwd(), "dev.db");
  try {
    if (!fs.existsSync(tempDbPath)) {
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tempDbPath);
        fs.chmodSync(tempDbPath, 0o666);
      }
    }
    databaseUrl = `file:${tempDbPath}`;
  } catch (err) {
    console.error("Failed to copy SQLite database to /tmp:", err);
  }
}

const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN, // required when databaseUrl is libsql://
});

const dbInstance = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export const db = globalForPrisma.prisma || dbInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
