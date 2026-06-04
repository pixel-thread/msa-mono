import {
  ContributionStatus,
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  UserRole,
} from '@prisma/client';
import { ConflictError, NotFoundError } from '@src/shared/errors';
import { prisma } from '@src/shared/lib';
import { validate } from '@src/shared/lib/validate';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { RequestHandler } from 'express';
import { success } from '@src/shared/utils/responses';
import z from 'zod';

export const CreateManualContributionPaymentSchema = z.object({
  userId: z.uuid(),
  contributionPeriodIds: z.array(z.uuid()),
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(PaymentMethod).default(PaymentMethod.CASH),
  referenceNumber: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const createManualContributionPaymentHandler: RequestHandler[] = [
  validate({ body: CreateManualContributionPaymentSchema }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.FINANCE);

    const { userId, amount, paymentMethod } = req.body as z.infer<
      typeof CreateManualContributionPaymentSchema
    >;

    const payment = await prisma.paymentTransaction.create({
      data: {
        userId: userId,
        associationId: user.associationId,
        amount,
        currency: 'INR',
        gateway: PaymentGateway.MANUAL,
        status: PaymentStatus.PENDING,
        method: paymentMethod,
        createdById: user.id,
      },
    });

    const result = await prisma.$transaction(async (tx) => {
      let remainingAmount = Number(payment.amount);

      let totalAllocated = 0;

      // -------------------------------------------------------------------
      // Fetch outstanding contribution periods
      // FIFO allocation
      // -------------------------------------------------------------------

      const outstandingPeriods = await tx.contributionPeriod.findMany({
        where: {
          id: { in: req.body.contributionPeriodIds },
          userId: payment.userId,
        },
        orderBy: [{ year: 'asc' }, { month: 'asc' }],
      });

      // -------------------------------------------------------------------
      // Allocate payment
      // -------------------------------------------------------------------

      for (const period of outstandingPeriods) {
        if (remainingAmount <= 0) {
          break;
        }

        const balance = Number(period.dueAmount);

        if (balance <= 0) {
          continue;
        }

        const allocation = Math.min(balance, remainingAmount);

        // ---------------------------------------------------------------
        // Create allocation record
        // ---------------------------------------------------------------

        await tx.paymentAllocation.create({
          data: {
            paymentTransactionId: payment.id,
            contributionPeriodId: period.id,
            allocatedAmount: allocation,
          },
        });

        const newPaidAmount = Number(period.paidAmount) + allocation;

        const newDueAmount = Number(period.expectedAmount) - newPaidAmount;

        // ---------------------------------------------------------------
        // Update contribution period
        // ---------------------------------------------------------------
        await tx.contributionPeriod.update({
          where: { id: period.id },
          data: {
            paidAmount: newPaidAmount,
            dueAmount: newDueAmount,
            status: newDueAmount <= 0 ? ContributionStatus.PAID : ContributionStatus.PARTIAL,
          },
        });

        totalAllocated += allocation;
        remainingAmount -= allocation;
      }

      // -------------------------------------------------------------------
      // Mark payment completed
      // -------------------------------------------------------------------

      const updatedPayment = await tx.paymentTransaction.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.COMPLETED,

          verifiedById: user.id,

          paidAt: payment.paidAt ?? new Date(),
        },
      });

      return {
        payment: updatedPayment,

        allocatedAmount: totalAllocated,

        unallocatedAmount: remainingAmount,

        periodsAffected: outstandingPeriods.length,
      };
    });

    return success(
      res,
      {
        data: result,
        message: 'Payment verified successfully',
      },
      200,
    );
  }),
];
