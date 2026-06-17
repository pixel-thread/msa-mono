import { validate } from '@lib/validate';
import { AuditAction, UserRole } from '@prisma/client';
import { logAction } from '@services/audit-logs';
import { prisma } from '@src/shared/lib';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';

import { recordContributionPayment } from '../services';
import type { RecordContributionInput } from '../validators';
import { RecordContributionSchema } from '../validators';

export const recordContributionHandler: RequestHandler[] = [
  validate({ body: RecordContributionSchema }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.FINANCE);
    const traceId = (req.traceId as string) || '';

    const { userId, amount, paymentMethod, contributionPeriodIds, paidAt } =
      req.body as RecordContributionInput;

    const result = await prisma.$transaction(async (tx) => {
      return await recordContributionPayment(
        userId,
        user.associationId,
        amount,
        paymentMethod,
        contributionPeriodIds,
        paidAt,
        user.id,
        tx,
      );
    });

    await logAction({
      associationId: user.associationId,
      actorId: user.id,
      action: AuditAction.PAYMENT_RECORD,
      resourceType: 'PaymentTransaction',
      resourceId: result.id,
      newValues: {
        userId,
        amount,
        paymentMethod,
        contributionPeriodIds,
      },
      traceId,
    });

    return success(res, {
      data: result,
      message: 'Contribution recorded successfully',
    });
  }),
];
