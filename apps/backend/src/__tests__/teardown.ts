import { prisma } from '@lib';

afterAll(async () => {
  await prisma.$disconnect();
});
