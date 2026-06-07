import { Prisma } from '@prisma/client';
import { prisma } from '@lib/prisma';
import { PAGE_SIZE } from '@src/shared/constants';
import { buildPaginationParams } from '@utils/helper';

type Props = {
  where: Prisma.ContributionPeriodWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.ContributionPeriodInclude;
};

export async function findContributionPeriods({
  where,
  page = 1,
  pageSize = PAGE_SIZE,
  include,
}: Props) {
  const { skip, take } = buildPaginationParams(page, pageSize);
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
