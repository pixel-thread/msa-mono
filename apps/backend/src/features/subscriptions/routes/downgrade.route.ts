import type { RequestHandler } from 'express';

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@src/shared/lib/validate';
import { success } from '@src/shared/utils/responses';
import { ValidationError } from '@src/shared/errors';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { logger } from '@src/shared/logger';
import { getAssociation } from '@src/shared/services/association/get-association';

// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { changePlan } from '@feature/subscriptions/services';
import { DowngradeSubscriptionSchema } from '../validators';
import { hasHighRoleAccess } from '@src/shared/utils';

// ---- POST /api/subscriptions/downgrade ---------------------------------------

/** @desc  Downgrade the current user's subscription to a cheaper plan
 *  @role  MEMBER */
export const postDowngrade: RequestHandler[] = [
  validate({ body: DowngradeSubscriptionSchema }),
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    let userId = req.user?.id;

    // Validate association membership
    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'POST /api/subscriptions/downgrade - Request started',
    );

    // Authorize user — MEMBER is the minimum
    const user = await withRole(req, UserRole.MEMBER);

    const isAdmin = hasHighRoleAccess(user.role);

    if (req.body.userId && isAdmin) {
      userId = req.body.userId;
    }

    logger.info({ traceId, userId: userId, actorId: user.id }, 'User authorized');

    if (!req.body) throw new ValidationError('Invalid request body');

    if (!userId) throw new ValidationError('Invalid request body');

    // Downgrade subscription to the target plan version
    const updated = await changePlan({
      planId: req.body.planId,
      userId: userId,
    });

    logger.info({ traceId, subscriptionId: updated.id }, 'Subscription downgraded');

    return success(res, { data: updated, message: 'Subscription downgraded successfully' });
  }),
];
