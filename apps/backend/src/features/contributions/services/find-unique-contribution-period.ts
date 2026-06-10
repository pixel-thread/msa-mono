import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.ContributionPeriodWhereUniqueInput;
  include?: Prisma.ContributionPeriodInclude;
  db?: DbClient;
};

export async function findUniqueContributionPeriod({ where, include, db = prisma }: Props) {
  return await db.contributionPeriod.findUnique({ where, include });
}
