// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments/history
// SECURITY:  Authenticated user (any role)
// PURPOSE:   Fetch the authenticated user's full payment history PLUS a
//            contribution summary (totals, overdue months, etc.).
//            Convenience endpoint returning both in one call.
// ---------------------------------------------------------------------------

import { ForbiddenError,UnauthorizedError } from '@errors';
import { getUserContributionSummary } from '@feature/contributions/services/contribution.service';
import { getUserPaymentHistory } from '@feature/payments/services/payment.service';
import { PaymentHistoryQuerySchema } from '@feature/payments/validators';
import { prisma } from '@lib/prisma';
import { validate } from '@lib/validate';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import { NextFunction, Request, Response } from 'express';

// ---- Helpers ----

/**
 * Resolve the authenticated user's association for multi-tenant scoping.
 */
async function getAssociation(req: Request) {
  const userId = req.user?.id as string;
  if (!userId) throw new UnauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { association: true },
  });

  if (!user || !user.associationId) throw new ForbiddenError('User association not found');

  return { id: user.association.id, slug: user.association.slug, name: user.association.name };
}

// ---- Handler ----

export const paymentHistory: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: PaymentHistoryQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId, query: req.query }, 'GET /api/payments/history - Request started');

    // --- Auth: ensure user belongs to an association ---
    await getAssociation(req);

    // --- Business logic: fetch history and summary in parallel ---
    const userId = req.user?.id as string;
    const page = (req.query as any)?.page ?? 1;
    const [history, summary] = await Promise.all([
      getUserPaymentHistory(userId, page),
      getUserContributionSummary(userId),
    ]);

    // --- Log: success ---
    logger.info(
      { traceId, count: history.transactions.length },
      'GET /api/payments/history - Success',
    );

    // --- Response ---
    return success(res, {
      data: { transactions: history.transactions, summary },
      meta: history.pagination,
    });
  }),
];
