import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let databaseUrl = process.env.DATABASE_URL || "file:./dev.db";

// Special handler for Vercel Serverless environment to support read-write SQLite
if (process.env.VERCEL) {
  const tempDbPath = "/tmp/dev.db";
  const bundledDbPath = path.join(process.cwd(), "dev.db");

  try {
    // Copy the database file to the writeable /tmp folder if not already copied
    if (!fs.existsSync(tempDbPath)) {
      console.log(`Copying database from ${bundledDbPath} to ${tempDbPath}`);
      if (fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tempDbPath);
        fs.chmodSync(tempDbPath, 0o666);
      } else {
        console.error(`Bundled database not found at ${bundledDbPath}`);
      }
    }
    databaseUrl = `file:${tempDbPath}`;
  } catch (err) {
    console.error("Failed to copy SQLite database to /tmp:", err);
  }
}

let dbInstance: PrismaClient;

const adapter = new PrismaLibSql({
  url: databaseUrl,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});
dbInstance = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export const db = globalForPrisma.prisma || dbInstance;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
