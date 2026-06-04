// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/contributions/users/:userId
// SECURITY:  Requires FINANCE role
// PURPOSE:   Fetch a specific user's contribution periods, along with a
//            contribution summary. Used by finance officers to review
//            individual member payment status.
// ---------------------------------------------------------------------------

import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

import { validate } from '@src/shared/lib/validate';
import { success } from '@src/shared/utils/responses';
import { buildPagination } from '@src/shared/utils/build-pagination';
import { logger } from '@src/shared/logger';
import { NotFoundError } from '@src/shared/errors';
import { z } from 'zod';
import { UserContributionsParamsSchema } from '@src/features/contributions/validators';
import { findFirstMember } from '@src/features/members/services/findFirstMember';
import { getUserContributionSummary } from '@src/features/contributions/services/contribution.service';
import { findContributionPeriods } from '@src/features/contributions/services/find-contribution-periods';
import { pageNumberValidation } from '@src/shared/validators/common';
import { PAGE_SIZE } from '@src/shared/constants';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { UserRole } from '@prisma/client';
import { getAssociation } from '@src/shared/services/association/get-association';

// ---- Validation schemas ----

const UserContributionsQuerySchema = z.object({
  page: pageNumberValidation,
  fromYear: z.coerce.number().int().min(2020).max(2100).optional(),
  fromMonth: z.coerce.number().int().min(1).max(12).optional(),
  toYear: z.coerce.number().int().min(2020).max(2100).optional(),
  toMonth: z.coerce.number().int().min(1).max(12).optional(),
});

// ===========================================================================
// GET /api/contributions/users/:userId
// ===========================================================================

export const userContributionsHandler: RequestHandler[] = [
  // Step 1: Validate params and query
  validate({ params: UserContributionsParamsSchema, query: UserContributionsQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, userId: req.params.userId },
      'GET /api/contributions/users/[userId] - Request started',
    );

    // --- Auth: resolve association ---
    const association = await getAssociation(req);

    // --- Auth: enforce FINANCE role ---
    await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'GET /api/contributions/users/[userId] - User authorized');

    // --- Business logic: fetch contributions with date range filter ---
    const { userId } = req.params as { userId: string };
    const {
      page = 1,
      fromYear,
      fromMonth,
      toYear,
      toMonth,
    } = (req.query as {
      page?: number;
      fromYear?: number;
      fromMonth?: number;
      toYear?: number;
      toMonth?: number;
    }) || {};

    const user = await findFirstMember({ where: { id: userId, associationId: association.id } });

    if (!user) throw new NotFoundError('User not found in this association');

    const whereClause: Record<string, unknown> = { userId, associationId: association.id };

    if (fromYear && fromMonth) {
      whereClause.AND = [
        { OR: [{ year: { gt: fromYear } }, { year: fromYear, month: { gte: fromMonth } }] },
      ];
    }
    if (toYear && toMonth) {
      const toClause = {
        OR: [{ year: { lt: toYear } }, { year: toYear, month: { lte: toMonth } }],
      };
      whereClause.AND = whereClause.AND
        ? [...(whereClause.AND as unknown[]), toClause]
        : [toClause];
    }

    logger.info(
      { traceId, userId },
      'GET /api/contributions/users/[userId] - Fetching contributions',
    );

    const { contributions, total } = await findContributionPeriods({
      where: whereClause as Parameters<typeof findContributionPeriods>[0]['where'],
      page,
      pageSize: PAGE_SIZE + 2,
      include: {
        allocations: {
          include: {
            paymentTransaction: {
              select: {
                id: true,
                amount: true,
                method: true,
                gateway: true,
                status: true,
                paidAt: true,
                receiptNumber: true,
              },
            },
          },
        },
      },
    });
    const summary = await getUserContributionSummary(userId);

    logger.info(
      { traceId, userId, count: contributions.length, total },
      'GET /api/contributions/users/[userId] - Success',
    );

    // --- Response ---
    return success(res, {
      data: { user, contributions, summary },
      meta: buildPagination(total, page),
    });
  }),
];
