import { PaymentGateway, Currency, PaymentStatus, UserRole } from '@prisma/client';
import { prisma } from '@src/shared/lib';
import { validate } from '@src/shared/lib/validate';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { RequestHandler } from 'express';
import { success } from '@src/shared/utils/responses';
import { allocatePaymentToContributions } from '../services';
import { BadRequestError } from '@src/shared/errors';
import { RecordContributionInput, RecordContributionSchema } from '../validators';

export const recordContributionHandler: RequestHandler[] = [
  validate({ body: RecordContributionSchema }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.FINANCE);

    const { userId, amount, paymentMethod, contributionPeriodIds } =
      req.body as RecordContributionInput;

    if (contributionPeriodIds.length === 0) {
      throw new BadRequestError('No contribution periods selected');
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.paymentTransaction.create({
        data: {
          userId: userId,
          associationId: user.associationId,
          amount,
          currency: Currency.INR,
          gateway: PaymentGateway.MANUAL,
          status: PaymentStatus.PENDING,
          method: paymentMethod,
          createdById: user.id,
        },
      });

      await allocatePaymentToContributions(
        tx,
        payment.id,
        userId,
        amount,
        contributionPeriodIds,
        user.id,
      );
      return payment;
    });

    return success(res, {
      data: result,
      message: 'Contribution recorded successfully',
    });
  }),
];
