import { prisma } from '@lib';

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch (e) {
    console.error('Failed to connect to test database. Ensure PostgreSQL is running and DATABASE_URL is set.');
    throw e;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
