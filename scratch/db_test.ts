import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking database connection...");
    const count = await prisma.idea.count();
    console.log(`Connection successful. Found ${count} ideas.`);
  } catch (error: any) {
    console.error("Database connection failed:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
