// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments
// SECURITY:  Requires FINANCE role
// PURPOSE:   List all payment transactions for the association with advanced
//            filtering (status, method, gateway, date range, search).
// ---------------------------------------------------------------------------

import { getAllTransactions } from '@feature/payments/services/payment.service';
import { GetTransactionsQuerySchema } from '@feature/payments/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Handler ----

export const listPayments: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: GetTransactionsQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const userId = req.user?.id as string;
    const associationId = req.user?.associationId as string;

    // --- Log: request started ---
    logger.info(
      { traceId, query: req.query, userId, assocaitonId: associationId },
      'GET /api/payments - Request started',
    );

    // --- Auth: resolve association ---

    // --- Auth: enforce FINANCE role ---
    // Only finance officers should view all transactions
    await withRole(req, UserRole.FINANCE);

    logger.info(
      { traceId, userId, assocaitonId: associationId },
      'GET /api/payments - User authorized',
    );

    // --- Business logic: fetch filtered transactions ---
    const result = await getAllTransactions(associationId, req.query || {});

    // --- Log: success ---
    logger.info(
      { traceId, count: result.transactions.length, associationId, userId },
      'GET /api/payments - Success',
    );

    // --- Response ---
    return success(res, {
      data: result.transactions,
      meta: result.pagination,
      message: 'Successfully fetched payment transactions',
    });
  }),
];
