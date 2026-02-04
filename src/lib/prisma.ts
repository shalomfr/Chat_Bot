import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Ensure fresh connection
async function ensureConnection() {
  try {
    await prisma.$connect();
  } catch (e) {
    console.error("Database connection error:", e);
    // Try to disconnect and reconnect
    await prisma.$disconnect();
    await prisma.$connect();
  }
}

// Connect on startup
ensureConnection();
