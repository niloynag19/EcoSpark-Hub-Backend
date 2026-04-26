import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing connection...');
    const count = await prisma.idea.count();
    console.log('Idea count:', count);

    const ideas = await prisma.idea.findMany({
      where: { status: 'APPROVED' },
      take: 1,
      include: {
        author: true,
        category: true,
      },
    });
    console.log('Ideas fetch success:', ideas.length);
  } catch (error) {
    console.error('DEBUG ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
