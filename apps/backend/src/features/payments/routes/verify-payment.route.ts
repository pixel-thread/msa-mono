// ---------------------------------------------------------------------------
// ENDPOINT:  POST /api/payments/verify
// SECURITY:  Authenticated user (any role); validates Razorpay callback
// PURPOSE:   Verify the Razorpay payment signature returned from the
//            client-side checkout and complete the transaction.
// ---------------------------------------------------------------------------

import { verifyAndCompletePayment } from '@feature/payments/services/payment.service';
import { VerifyPaymentSchema } from '@feature/payments/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Handler ----

export const verifyPayment: RequestHandler[] = [
  // Step 1: Validate request body
  validate({ body: VerifyPaymentSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    await withRole(req, UserRole.MEMBER);

    // --- Log: request started ---
    logger.info(
      { traceId, razorpayOrderId: req.body.razorpayOrderId },
      'POST /api/payments/verify - Request started',
    );

    // --- Business logic: verify signature & complete payment ---
    logger.info(
      { traceId, razorpayOrderId: req.body.razorpayOrderId },
      'POST /api/payments/verify - Verifying payment',
    );
    const result = await verifyAndCompletePayment({
      razorpayOrderId: req.body.razorpayOrderId,
      razorpayPaymentId: req.body.razorpayPaymentId,
      razorpaySignature: req.body.razorpaySignature,
    });

    // --- Log: success ---
    logger.info(
      { traceId, razorpayOrderId: req.body.razorpayOrderId },
      'POST /api/payments/verify - Success',
    );

    // --- Response ---
    return success(
      res,
      { data: result, message: 'Payment verified and completed successfully' },
      200,
    );
  }),
];
