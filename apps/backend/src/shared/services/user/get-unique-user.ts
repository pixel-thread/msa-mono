import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.UserWhereUniqueInput;
  db?: DbClient;
};

/** Finds a unique user by its identifier, returning only safe/public fields. */
export async function findUniqueUser({ where, db = prisma }: Props) {
  return await db.user.findUnique({
    where,

    select: {
      id: true,
      associationId: true,
      email: true,
      name: true,
      role: true,
      status: true,
      memberTypeId: true,
      imageUrl: true,
    },
  });
}
