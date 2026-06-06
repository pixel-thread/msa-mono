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
import { upgradeSubscription } from '@feature/subscriptions/services';
import { UpgradeSubscriptionSchema } from '../validators';
import { hasHighRoleAccess } from '@src/shared/utils';

// ---- POST /api/subscriptions/upgrade -----------------------------------------
/** @desc  Upgrade the current user's subscription to a new plan
 *  @role  MEMBER */
export const postUpgrade: RequestHandler[] = [
  validate({ body: UpgradeSubscriptionSchema }),
  asyncHandler(async (req, res) => {
    const traceId = (req.traceId as string) || '';
    let userId = req.user?.id;

    // Validate association membership
    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'POST /api/subscriptions/upgrade - Request started',
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

    // Upgrade subscription to the target plan version
    const updated = await upgradeSubscription({
      planId: req.body.planId,
      userId: userId,
    });

    logger.info({ traceId, subscriptionId: updated.id }, 'Subscription upgraded');

    return success(res, { data: updated, message: 'Subscription upgraded successfully' });
  }),
];
