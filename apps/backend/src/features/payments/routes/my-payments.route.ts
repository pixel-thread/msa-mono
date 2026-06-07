// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments/my
// SECURITY:  Requires MEMBER role
// PURPOSE:   Fetch the authenticated user's own payment transactions with
//            pagination. Self-service — no finance role required.
// ---------------------------------------------------------------------------

import { findPaymentTransactions } from '@feature/payments/services/find-payment-transactions';
import { PaymentHistoryQuerySchema } from '@feature/payments/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { buildPagination } from '@src/shared/utils/helper/build-pagination';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Handler ----

export const myPayments: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: PaymentHistoryQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId, query: req.query }, 'GET /api/payments/my - Request started');

    // --- Auth: enforce MEMBER role ---
    const userId = req.user?.id as string;
    await withRole(req, UserRole.MEMBER);
    logger.info({ traceId, userId }, 'GET /api/payments/my - User authorized');

    // --- Business logic: fetch user's own transactions ---
    const { page = 1, pageSize = 20 } = (req.query as any) || {};
    const { transactions: payments, total } = await findPaymentTransactions({
      where: { userId, associationId: req.user!.associationId },
      page,
      pageSize,
    });

    // --- Log: success ---
    logger.info({ traceId, count: payments.length, total }, 'GET /api/payments/my - Success');

    // --- Response ---
    return success(res, { data: payments, meta: buildPagination(total, page, pageSize) });
  }),
];
