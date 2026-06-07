// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments/history
// SECURITY:  Authenticated user (any role)
// PURPOSE:   Fetch the authenticated user's full payment history PLUS a
//            contribution summary (totals, overdue months, etc.).
//            Convenience endpoint returning both in one call.
// ---------------------------------------------------------------------------

import { getUserContributionSummary } from '@feature/contributions/services/contribution.service';
import { getUserPaymentHistory } from '@feature/payments/services/payment.service';
import { PaymentHistoryQuerySchema } from '@feature/payments/validators';
import { validate } from '@lib/validate';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Handler ----

export const paymentHistory: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: PaymentHistoryQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId, query: req.query }, 'GET /api/payments/history - Request started');

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
