import type { RetroactiveAffectedUsersInput } from '@feature/contributions/validators';
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';
import { PAGE_SIZE } from '@src/shared/constants';

export async function getRetroactiveAffectedUsers(
  associationId: string,
  filters: RetroactiveAffectedUsersInput,
  page = 1,
  limit: number = PAGE_SIZE || 20,
) {
  const { planVersionId, startDate, endDate } = filters;

  const where: Prisma.RetroactiveAffectedUserWhereInput = {
    retroactiveAdjustment: {
      associationId,
      ...(planVersionId ? { planVersionId } : {}),
      ...(startDate && endDate ? { createdAt: { gte: startDate, lte: endDate } } : {}),
    },
  };

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.retroactiveAffectedUser.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
            imageUrl: true,
            memberTypeId: true,
          },
        },
        contributionPeriod: true,
        retroactiveAdjustment: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.retroactiveAffectedUser.count({ where }),
  ]);

  return { records, total };
}
