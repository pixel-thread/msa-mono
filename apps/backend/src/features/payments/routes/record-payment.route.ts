// ---------------------------------------------------------------------------
// ENDPOINT:  POST /api/payments/record
// SECURITY:  Requires FINANCE role
// PURPOSE:   Record a manual (offline) payment — cash, UPI, bank transfer, or
//            cheque — on behalf of a member. Allocates the payment to
//            outstanding contribution periods (FIFO) and creates ledger entries.
// ---------------------------------------------------------------------------

import { recordManualPayment } from '@feature/payments/services/payment.service';
import { RecordManualPaymentSchema } from '@feature/payments/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

export const recordPayment: RequestHandler[] = [
  // Step 1: Validate request body
  validate({ body: RecordManualPaymentSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId }, 'POST /api/payments/record - Request started');

    // --- Auth: enforce FINANCE role ---
    // Only finance officers can record payments on behalf of others
    const user = await withRole(req, UserRole.FINANCE);
    logger.info({ traceId, userId: user.id }, 'POST /api/payments/record - User authorized');

    // --- Business logic: record the manual payment ---
    logger.info(
      { traceId, amount: req.body.amount, actorId: user.id, assocaitonId: req.user?.associationId },
      'POST /api/payments/record - Recording manual payment',
    );
    const transaction = await recordManualPayment({
      associationId: req.user?.associationId as string,
      amount: req.body.amount,
      method: req.body.method,
      notes: req.body.notes,
      incomeAccountId: req.body.incomeAccountId,
      createdById: user.id,
      paidAt: req.body.paidAt,
      reference: req.body.reference,
      referenceType: req.body.referenceType,
    });

    // --- Log: success ---
    logger.info(
      { traceId, transactionId: transaction.id, associationId: req.user?.associationId },
      'POST /api/payments/record - Success',
    );

    // --- Response ---
    return success(
      res,
      { data: transaction, message: 'Payment recorded and allocated successfully' },
      201,
    );
  }),
];
