import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';
import { buildPaginationParams } from '@utils/helper';

type Props = {
  where: Prisma.ContributionPeriodWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.ContributionPeriodInclude;
};

export async function findContributionPeriods({ where, page = 1, include }: Props) {
  const { skip, take } = buildPaginationParams(page);
  const [contributions, total] = await Promise.all([
    prisma.contributionPeriod.findMany({
      where,
      include,
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      take,
      skip,
    }),
    prisma.contributionPeriod.count({ where }),
  ]);
  return { contributions, total };
}
