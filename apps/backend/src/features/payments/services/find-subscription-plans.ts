import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';

type Props = {
  where: Prisma.SubscriptionPlanWhereInput;
  include?: Prisma.SubscriptionPlanInclude;
};

export async function findSubscriptionPlans({ where, include }: Props) {
  return await prisma.subscriptionPlan.findMany({
    where,
    include,
    orderBy: { createdAt: 'desc' },
  });
}
