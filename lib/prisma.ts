import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const adapter = new PrismaPg(connectionString);
  return new PrismaClient({ adapter });
}

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

// Lazy singleton — only connects when first used
let _prisma: PrismaClient | null = null;
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!_prisma) _prisma = getPrisma();
    const value = (_prisma as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === "function") {
      return value.bind(_prisma);
    }
    return value;
  },
});
