import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';
import { findPaginated } from '@services/find-paginated';

type Props = {
  where: Prisma.ContributionPeriodWhereInput;
  page?: number;
  pageSize?: number;
  include?: Prisma.ContributionPeriodInclude;
};

export async function findContributionPeriods({ where, page = 1, include }: Props) {
  const { items, total } = await findPaginated(
    prisma.contributionPeriod,
    { where, include, orderBy: [{ year: 'asc' }, { month: 'asc' }], page },
  );
  return { contributions: items, total };
}
