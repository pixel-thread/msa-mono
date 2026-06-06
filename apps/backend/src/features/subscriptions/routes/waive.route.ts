// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
import { success } from '@utils/responses';
import { ValidationError } from '@errors';
import { withRole } from '@utils/with-role';
import { asyncHandler } from '@utils/async-handler';
import { logger } from '@src/shared/logger';
import { getAssociation } from '@services/association/get-association';

// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';

// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import { WaiveSubscriptionSchema } from '@feature/subscriptions/validators';

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { waiveSubscription } from '@feature/subscriptions/services';

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
