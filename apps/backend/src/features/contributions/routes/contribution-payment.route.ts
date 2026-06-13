import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
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

    return success(res, {
      data: result,
      message: 'Contribution recorded successfully',
    });
  }),
];
