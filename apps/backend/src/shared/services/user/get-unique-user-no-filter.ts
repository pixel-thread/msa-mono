import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type Props = {
  where: Prisma.UserWhereUniqueInput;
};

/** Finds a user by its unique identifier without applying any visibility filter. */
export async function getUniqueUserNoFilter({ where }: Props) {
  return await prisma.user.findUnique({
    where,
  });
}
