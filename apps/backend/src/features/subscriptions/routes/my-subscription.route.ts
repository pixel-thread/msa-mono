// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { getMySubscription } from '@feature/subscriptions/services';
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
import { pageNumberValidation } from '@validator/common';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// ---- Schemas -----------------------------------------------------------------

/** Schema for paginated my-subscription query. */
const MySubscriptionQuerySchema = z.object({
  page: pageNumberValidation,
});

// ---- GET /api/subscriptions/my -----------------------------------------------
/** @desc  Retrieve the current user's own subscriptions (paginated)
 *  @role  MEMBER */
export const getMySubscriptionHandler: RequestHandler[] = [
  validate({ query: MySubscriptionQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/subscriptions/my - Request started',
    );

    const page = (req.query as any)?.page || 1;

    // Authorize user — MEMBER is the minimum
    const user = await withRole(req, UserRole.MEMBER);
    logger.info({ traceId, userId: user.id }, 'User authorized');

    // Fetch the user's subscriptions with pagination
    const result = await getMySubscription(user.id, page);

    return success(res, result);
  }),
];

export const getUserSubscriptionHandler: RequestHandler[] = [
  validate({ query: MySubscriptionQuerySchema, params: z.object({ userId: z.string() }) }),
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    const associationId = req.user?.associationId as string;

    const userId = req.params.userId as string;

    // Validate association membership
    logger.info(
      { traceId, associationId: associationId },
      'GET /api/subscriptions/my - Request started',
    );

    const page = (req.query?.page as string) || '1';

    // Authorize user — MEMBER is the minimum
    const actor = await withRole(req, UserRole.SECRETARY);
    logger.info({ traceId, userId: userId, actorId: actor.id }, 'User authorized');

    // Fetch the user's subscriptions with pagination
    const result = await getMySubscription(userId, parseInt(page));

    return success(res, {
      data: result.data,
      meta: result.meta,
      message: 'Subscriptions fetched successfully',
    });
  }),
];
