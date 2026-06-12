import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.PlanWhereInput;
  include?: Prisma.PlanInclude;
  db?: DbClient;
};

export async function findPlans({ where, include, db = prisma }: Props) {
  return await db.plan.findMany({
    where,
    include,
    orderBy: { createdAt: 'desc' },
  });
}
