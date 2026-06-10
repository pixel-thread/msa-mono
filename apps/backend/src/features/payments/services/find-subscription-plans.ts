import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type DbClient = Prisma.TransactionClient | typeof prisma;

type Props = {
  where: Prisma.SubscriptionPlanWhereInput;
  include?: Prisma.SubscriptionPlanInclude;
  db?: DbClient;
};

export async function findSubscriptionPlans({ where, include, db = prisma }: Props) {
  return await db.subscriptionPlan.findMany({
    where,
    include,
    orderBy: { createdAt: 'desc' },
  });
}
