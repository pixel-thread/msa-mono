import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';

type Props = {
  where: Prisma.ContributionPeriodWhereInput;
  include?: Prisma.ContributionPeriodInclude;
};

export async function findUniqueContributionPeriod({ where, include }: Props) {
  return await prisma.contributionPeriod.findFirst({ where, include });
}
