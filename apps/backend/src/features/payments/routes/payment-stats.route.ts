// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments/stats
// SECURITY:  Requires FINANCE role
// PURPOSE:   Return top-level financial statistics for the association
//            dashboard: total collected this month, pending dues amount,
//            and the count of members with outstanding dues.
// ---------------------------------------------------------------------------

import { getFinancialStats } from '@feature/payments/services/payment.service';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Handler ----

export const paymentStats: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId }, 'GET /api/payments/stats - Request started');

    // --- Auth: enforce FINANCE role ---
    await withRole(req, UserRole.FINANCE);
    logger.info({ traceId }, 'GET /api/payments/stats - User authorized');

    // --- Business logic: compute financial stats ---
    const data = await getFinancialStats(req.user!.associationId);

    // --- Log: success ---
    logger.info({ traceId }, 'GET /api/payments/stats - Success');

    // --- Response ---
    return success(res, { data: data.stats, meta: data.pagination });
  }),
];
