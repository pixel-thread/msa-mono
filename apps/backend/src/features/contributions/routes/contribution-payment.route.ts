import { UserRole } from '@prisma/client';
import { validate } from '@src/shared/lib/validate';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { RequestHandler } from 'express';
import { success } from '@src/shared/utils/responses';
import { recordContributionPayment } from '../services';
import { RecordContributionInput, RecordContributionSchema } from '../validators';

export const recordContributionHandler: RequestHandler[] = [
  validate({ body: RecordContributionSchema }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.FINANCE);

    const { userId, amount, paymentMethod, contributionPeriodIds, paidAt } =
      req.body as RecordContributionInput;

    const result = await recordContributionPayment(
      userId,
      user.associationId,
      amount,
      paymentMethod,
      contributionPeriodIds,
      paidAt,
      user.id,
    );

    return success(res, {
      data: result,
      message: 'Contribution recorded successfully',
    });
  }),
];
