import type { Prisma } from '@prisma/client';
import { prisma } from '@src/shared/lib';

type Props = {
  where?: Prisma.UserWhereInput;
  include?: Prisma.UserInclude;
};

export async function findUnpaginatedUsers({ where, include }: Props = {}) {
  const { users } = await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({ where, include });
    return { users };
  });
  return users;
}
