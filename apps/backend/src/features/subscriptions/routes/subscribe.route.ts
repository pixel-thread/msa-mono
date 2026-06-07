// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ValidationError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { subscribe } from '@feature/subscriptions/services';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import { SubscribeSchema } from '@feature/subscriptions/validators';
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
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- POST /api/subscriptions/subscribe ---------------------------------------
/** @desc  Subscribe the current user to a plan (creates or upserts)
 *  @role  MEMBER */
export const postSubscribe: RequestHandler[] = [
  validate({ body: SubscribeSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/subscriptions/subscribe - Request started',
    );

    // Authorize user — MEMBER is the minimum
    const user = await withRole(req, UserRole.MEMBER);
    logger.info({ traceId, userId: user.id }, 'User authorized');

    if (!req.body) throw new ValidationError('Invalid request body');

    // Create or update the user's subscription to the requested plan
    const subscription = await subscribe({
      planId: req.body.planId,
      userId: user.id,
      associationId: req.user!.associationId,
    });

    logger.info({ traceId, subscriptionId: subscription.id }, 'Subscription created');

    return success(res, { data: subscription }, 201);
  }),
];
