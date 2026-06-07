// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ValidationError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { waiveSubscription } from '@feature/subscriptions/services';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import { WaiveSubscriptionSchema } from '@feature/subscriptions/validators';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import { NextFunction, Request, Response } from 'express';

// ---- POST /api/subscriptions/waive -------------------------------------------
/** @desc  Waive a subscription (mark as WAIVED with a reason)
 *  @role  SECRETARY */
export const postWaive: RequestHandler[] = [
  validate({ body: WaiveSubscriptionSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // Validate association membership
    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'POST /api/subscriptions/waive - Request started',
    );

    // Authorize user — SECRETARY required for waiver creation
    const user = await withRole(req, UserRole.SECRETARY);
    logger.info({ traceId, userId: user.id }, 'User authorized');

    if (!req.body) throw new ValidationError('Invalid request body');

    // Mark subscription as waived with the provided reason
    const updated = await waiveSubscription({
      subscriptionId: req.body.subscriptionId,
      reason: req.body.reason,
      userId: user.id,
      associationId: association.id,
    });

    logger.info({ traceId, subscriptionId: req.body.subscriptionId }, 'Subscription waived');

    return success(res, { data: updated });
  }),
];
