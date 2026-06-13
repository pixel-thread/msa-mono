import { prisma } from '@lib/prisma';
import type { ContributionPeriod, Prisma } from '@prisma/client';
import { findPaginated } from '@services/find-paginated';

type Props = {
  where: Prisma.ContributionPeriodWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.ContributionPeriodInclude;
};

export async function findContributionPeriods({ where, page = 1, include }: Props) {
  if (page === 0) {
    return await prisma.$transaction(async (tx) => {
      const contributions = await tx.contributionPeriod.findMany({
        where: { userId: where.userId, associationId: where.associationId },
        include,
      });

      const total = await tx.contributionPeriod.count({
        where: { userId: where.userId, associationId: where.associationId },
      });

      return { contributions, total };
    });
  }
  const { items, total } = await findPaginated(prisma.contributionPeriod, {
    where,
    include,
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
    page,
  });
  return { contributions: items as ContributionPeriod[], total };
}
