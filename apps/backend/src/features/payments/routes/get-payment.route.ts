// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments/:paymentId
// SECURITY:  Requires MEMBER role; members can only view their own payments
//            unless they hold a finance/admin role.
// PURPOSE:   Fetch a single payment transaction by ID with full context
//            (user info, allocations, ledger entries).
// ---------------------------------------------------------------------------

import { ForbiddenError, NotFoundError } from '@errors';
import { getTransactionById } from '@feature/payments/services/payment.service';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { PaymentIdParamSchema } from '@feature/payments/validators';

// ---- Handler ----

export const getPayment: RequestHandler[] = [
  // Step 1: Validate path params
  validate({ params: PaymentIdParamSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId }, 'GET /api/payments/[id] - Request started');

    // --- Auth: enforce MEMBER role ---
    const paymentId = req.params.paymentId;
    if (!paymentId) throw new NotFoundError('Payment ID');
    const user = await withRole(req, UserRole.MEMBER);
    logger.info(
      { traceId, userId: user.id, paymentId },
      'GET /api/payments/[id] - User authorized',
    );

    // --- Business logic: fetch transaction ---
    const transaction = await getTransactionById(paymentId as string, req.user!.associationId);
    if (!transaction) throw new NotFoundError('Transaction');

    // --- Authorization check: is the user allowed to see this transaction? ---
    // Finance, Secretary, President, and Super Admin can see any transaction.
    // Regular members can only see their own.
    const adminRoles: UserRole[] = [
      UserRole.FINANCE,
      UserRole.SECRETARY,
      UserRole.PRESIDENT,
      UserRole.SUPER_ADMIN,
    ];
    const isFinance = user.role.some((r) => adminRoles.includes(r));
    if (!isFinance && transaction.userId !== user.id) {
      throw new ForbiddenError('You do not have permission to view this transaction');
    }

    // --- Log: success ---
    logger.info({ traceId, paymentId }, 'GET /api/payments/[id] - Success');

    // --- Response ---
    return success(res, { data: transaction });
  }),
];
