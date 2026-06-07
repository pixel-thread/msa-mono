// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { getSubscriptionPayments } from '@feature/subscriptions/services';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';

import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import {
  SubscriptionParamsSchema,
  SubscriptionQuerySchema,
} from '@feature/subscriptions/validators';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Schemas -----------------------------------------------------------------

// ---- GET /api/subscriptions/:subscriptionId/payments --------------------------
/** @desc  Retrieve paginated payments for a given subscription
 *  @role  MEMBER (scoped by ownership or high-role) */
export const getSubscriptionPaymentsHandler: RequestHandler[] = [
  validate({ params: SubscriptionParamsSchema, query: SubscriptionQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/subscriptions/[subscriptionId]/payments - Request started',
    );

    // Authorize user — MEMBER minimum; further ownership checks inside service
    const user = await withRole(req, UserRole.MEMBER);
    logger.info({ traceId, userId: user.id }, 'User authorized');

    const page = (req.query as any)?.page || 1;
    const subscriptionId = req.params.subscriptionId;

    // Fetch payments; service enforces that only the subscription owner or high-role users may view
    const result = await getSubscriptionPayments({
      subscriptionId: subscriptionId as string,
      userId: user.id,
      role: user.role,
      associationId: req.user!.associationId,
      page,
    });

    logger.info({ traceId, subscriptionId, count: result.data.length }, 'Payments fetched');

    return success(res, result);
  }),
];
