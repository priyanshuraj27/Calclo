import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
  process.env.DATABASE_URL = process.env.POSTGRES_URL;
}

export const prisma = new PrismaClient();
