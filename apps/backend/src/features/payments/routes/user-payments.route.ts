// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments/users/:userId
//            GET /api/payments/users/:userId/contributions
// SECURITY:  Requires FINANCE role
// PURPOSE:   Fetch a specific user's payment transactions or contribution
//            periods, along with a contribution summary. Used by finance
//            officers to review individual member payment status.
// ---------------------------------------------------------------------------

import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

import { validate } from '@src/shared/lib/validate';
import { success } from '@src/shared/utils/responses';
import { buildPagination } from '@src/shared/utils/build-pagination';
import { logger } from '@src/shared/logger';
import { NotFoundError } from '@src/shared/errors';
import { z } from 'zod';
import { findFirstMember } from '@src/features/members/services/findFirstMember';
import { getUserContributionSummary } from '@src/features/contributions/services/contribution.service';
import { findPaymentTransactions } from '@src/features/payments/services/find-payment-transactions';
import { pageNumberValidation } from '@src/shared/validators/common';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { UserRole } from '@prisma/client';
import { getAssociation } from '@src/shared/services/association/get-association';

// ---- Validation schemas ----

const UserPaymentsQuerySchema = z.object({
  page: pageNumberValidation,
});

const UserContributionsParamsSchema = z.object({
  userId: z.uuid('Invalid user ID'),
});

// ---- Helpers ----

// ===========================================================================
// GET /api/payments/users/:userId
// ===========================================================================

export const userPayments: RequestHandler[] = [
  // Step 1: Validate params and query
  validate({ params: UserContributionsParamsSchema, query: UserPaymentsQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, userId: req.params.userId },
      'GET /api/payments/users/[userId] - Request started',
    );

    // --- Auth: resolve association ---
    const association = await getAssociation(req);

    // --- Auth: enforce FINANCE role ---
    await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'GET /api/payments/users/[userId] - User authorized');

    // --- Business logic: fetch member and their transactions ---
    const { userId } = req.params as { userId: string };
    const page = (req.query as any)?.page || 1;
    const user = await findFirstMember({ where: { id: userId, associationId: association.id } });
    if (!user) throw new NotFoundError('User not found in this association');

    logger.info({ traceId, userId }, 'GET /api/payments/users/[userId] - Fetching transactions');
    const { transactions, total } = await findPaymentTransactions({
      where: { userId, associationId: association.id },
      page,
      pageSize: 10,
      include: {
        allocations: {
          include: {
            contributionPeriod: {
              select: { year: true, month: true, expectedAmount: true, status: true },
            },
          },
        },
      },
    });
    const summary = await getUserContributionSummary(userId);

    // --- Log: success ---
    logger.info(
      { traceId, userId, count: transactions.length, total },
      'GET /api/payments/users/[userId] - Success',
    );

    // --- Response ---
    return success(res, {
      data: { user, transactions, summary },
      meta: buildPagination(total, page),
    });
  }),
];
