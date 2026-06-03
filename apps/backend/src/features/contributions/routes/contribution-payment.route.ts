import { PaymentGateway, PaymentMethod, PaymentStatus, UserRole } from '@prisma/client';
import { ConflictError, NotFoundError } from '@src/shared/errors';
import { prisma } from '@src/shared/lib';
import { validate } from '@src/shared/lib/validate';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { RequestHandler } from 'express';
import { success } from '@src/shared/utils/responses';
import z from 'zod';

export const CreateManualContributionPaymentSchema = z.object({
  memberId: z.uuid(),
  amount: z.coerce.number().positive(),
  paymentMethod: z.enum(PaymentMethod),
  referenceNumber: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export const createManualContributionPaymentHandler: RequestHandler[] = [
  validate({
    body: CreateManualContributionPaymentSchema,
  }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.FINANCE);

    const { memberId, amount, paymentMethod, referenceNumber, remarks } = req.body;

    const payment = await prisma.paymentTransaction.create({
      data: {
        userId: memberId,
        associationId: user.associationId,
        amount,
        currency: 'INR',
        gateway: PaymentGateway.MANUAL,
        status: PaymentStatus.PENDING,
        method: paymentMethod,

        referenceNumber,

        notes: remarks,

        createdById: user.id,
      },
    });

    return success(
      res,
      {
        data: payment,
        message: 'Payment created successfully',
      },
      201,
    );
  }),
];

export const verifyManualContributionPaymentHandler: RequestHandler[] = [
  validate({ params: z.object({ paymentId: z.uuid() }) }),
  asyncHandler(async (req, res) => {
    const accountant = await withRole(req, UserRole.FINANCE);

    const paymentId = req.params.paymentId as string;

    const payment = await prisma.paymentTransaction.findUnique({
      where: {
        id: paymentId,
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new ConflictError('Payment already Verified');
    }

    await prisma.$transaction(async (tx) => {
      await tx.paymentTransaction.update({
        where: {
          id: payment.id,
        },
        data: {
          status: PaymentStatus.COMPLETED,
          verifiedById: accountant.id,
        },
      });

      let remainingAmount = Number(payment.amount);

      const unpaidPeriods = await tx.contributionPeriod.findMany({
        where: {
          userId: payment.userId,
          status: {
            in: ['DUE', 'PAID'],
          },
        },
        orderBy: [
          {
            year: 'asc',
          },
          {
            month: 'asc',
          },
        ],
      });

      for (const period of unpaidPeriods) {
        if (remainingAmount <= 0) {
          break;
        }

        const alreadyPaid = await tx.paymentAllocation.aggregate({
          where: {
            contributionPeriodId: period.id,
          },
          _sum: {
            allocatedAmount: true,
          },
        });

        const paidAmount = Number(alreadyPaid._sum.allocatedAmount ?? 0);

        const balance = Number(period.expectedAmount) - paidAmount;

        if (balance <= 0) {
          continue;
        }

        const allocation = Math.min(balance, remainingAmount);

        await tx.paymentAllocation.create({
          data: {
            paymentTransactionId: payment.id,
            contributionPeriodId: period.id,
            allocatedAmount: allocation,
          },
        });

        remainingAmount -= allocation;

        const newPaidAmount = paidAmount + allocation;

        await tx.contributionPeriod.update({
          where: {
            id: period.id,
          },
          data: {
            status: newPaidAmount >= Number(period.expectedAmount) ? 'PAID' : 'PARTIAL',
          },
        });
      }
    });

    return success(res, {
      data: payment,
      message: 'Payment verified successfully',
    });
  }),
];
