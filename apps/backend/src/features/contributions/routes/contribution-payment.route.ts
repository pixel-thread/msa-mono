import { PaymentGateway, PaymentMethod, Currency, PaymentStatus, UserRole } from '@prisma/client';
import { prisma } from '@src/shared/lib';
import { validate } from '@src/shared/lib/validate';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { RequestHandler } from 'express';
import { success } from '@src/shared/utils/responses';
import z from 'zod';
import { allocatePaymentToContributions } from '../services';

export const RecordContributionSchema = z.object({
  userId: z.uuid('Invalid User'),
  contributionPeriodIds: z.array(z.uuid()),
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.CASH),
  referenceNumber: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

type RecordContributionInput = z.infer<typeof RecordContributionSchema>;

export const recordContributionHandler: RequestHandler[] = [
  validate({ body: RecordContributionSchema }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.FINANCE);

    const { userId, amount, paymentMethod, contributionPeriodIds } =
      req.body as RecordContributionInput;

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

      console.log('Contribtion periods before allocate payment', contributionPeriodIds.length);
      await allocatePaymentToContributions(
        tx,
        payment.id,
        userId,
        amount,
        req.body.contributionPeriodIds,
        user.id,
      );
    });

    return success(res, {
      data: result,
      message: 'Contribution recorded successfully',
    });
  }),
];
