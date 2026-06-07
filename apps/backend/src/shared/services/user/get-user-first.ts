import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';

type Props = {
  where: Prisma.UserWhereInput;
};

/** Finds the first user matching the given filter criteria. */
export async function getUserFirst(props: Props) {
  return await prisma.user.findFirst(props);
}
