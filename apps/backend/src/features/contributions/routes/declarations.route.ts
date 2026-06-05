import {
  ContributionStatus,
  DeclerationStatus,
  Prisma,
  UserRole,
  UserStatus,
} from '@prisma/client';
import { prisma } from '@src/shared/lib';
import { validate } from '@src/shared/lib/validate';
import { getAssociation } from '@src/shared/services/association/get-association';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { RequestHandler } from 'express';
import { success } from '@src/shared/utils/responses';
import z from 'zod';
import { BadRequestError, NotFoundError } from '@src/shared/errors';
import { differenceInCalendarMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { findDeclarations } from '../services/find-declarations';

const CreateUserDeclarations = z.object({
  monthlyContributionAmount: z.number().int().min(1).max(10000),
});

export const createUserDeclarationHandler: RequestHandler[] = [
  validate({ body: CreateUserDeclarations }),
  asyncHandler(async (req, res) => {
    const association = await getAssociation(req);
    const user = await withRole(req, UserRole.MEMBER);

    const { monthlyContributionAmount } = req.body;

    const lastDeclaration = await prisma.declarations.findFirst({
      where: {
        memberId: user.id,
        status: 'APPROVED',
      },
      orderBy: {
        declerationEndDate: 'desc',
      },
    });

    const today = new Date();
    let startDate = lastDeclaration ? new Date(lastDeclaration.declerationEndDate) : new Date();

    if (lastDeclaration) {
      const lastEndDate = new Date(lastDeclaration.declerationEndDate);
      const monthSinceLastDeclaration = differenceInCalendarMonths(today, lastEndDate);

      if (monthSinceLastDeclaration < 1) {
        throw new BadRequestError('You must wait at least 1 months between declarations.');
      }
      startDate = startOfMonth(addMonths(lastEndDate, 1));
    } else {
      startDate = startOfMonth(today);
    }

    const endDate = endOfMonth(startDate);

    const declear = await prisma.declarations.create({
      data: {
        memberId: user.id,
        associationId: association.id,

        declerationStartDate: startDate,
        declerationEndDate: endDate,

        amount: monthlyContributionAmount,

        status: DeclerationStatus.PENDING,
      },
    });

    return success(res, {
      data: {
        id: declear.id,
        status: DeclerationStatus.PENDING,
        declerationStartDate: declear.declerationStartDate,
        declerationEndDate: declear.declerationEndDate,
        amount: declear.amount,
      },
      message: 'Declaration submitted successfully.',
    });
  }),
];

export const listUserDeclarationsHandler: RequestHandler[] = [
  asyncHandler(async (req, res) => {
    const association = await getAssociation(req);
    const user = await withRole(req, UserRole.MEMBER);

    const declarations = await findDeclarations({
      where: {
        memberId: user.id,
        associationId: association.id,
      },
    });

    return success(res, {
      data: declarations,
      message: 'Declarations successfully fetch.',
    });
  }),
];

export const listDeclarationsHandler: RequestHandler[] = [
  asyncHandler(async (req, res) => {
    const association = await getAssociation(req);
    await withRole(req, UserRole.FINANCE);

    const declarations = await findDeclarations({
      where: { associationId: association.id },
      include: { member: { select: { name: true, email: true, mobile: true } } },
    });

    return success(res, {
      data: declarations,
      message: 'Declarations successfully fetch.',
    });
  }),
];

export const approveDeclarationsHandler: RequestHandler[] = [
  validate({ params: z.object({ id: z.string() }) }),
  asyncHandler(async (req, res) => {
    const declarationId = req.params.id as string;
    const association = await getAssociation(req);

    await withRole(req, UserRole.FINANCE);

    const existingDeclaration = await prisma.declarations.findUnique({
      where: { id: declarationId, associationId: association.id },
    });

    if (!existingDeclaration) throw new NotFoundError('Declaration not found');

    if (existingDeclaration.status === DeclerationStatus.APPROVED) {
      return success(res, {
        data: existingDeclaration,
        message: 'Declaration already approved.',
      });
    }

    // 1. Update the declaration status
    const updatedDeclaration = await prisma.declarations.update({
      where: {
        id: declarationId,
        associationId: association.id,
      },
      data: {
        status: DeclerationStatus.APPROVED,
        reviewBy: req.user?.id,
        reviewAt: new Date(),
        lastDeclarationDate: new Date(),
      },
    });

    // 2. Fetch active members
    const activeMembers = await prisma.user.findMany({
      where: {
        associationId: association.id,
        status: UserStatus.ACTIVE,
        subscription: { status: 'ACTIVE' },
      },
      include: {
        subscription: { include: { plan: true, planVersion: true } },
      },
    });

    // If no active members, return early with success response
    if (activeMembers.length === 0) {
      return success(res, {
        data: updatedDeclaration,
        message: 'Declarations approved, but no active members found to generate periods.',
      });
    }

    // 3. Generate Month Ranges
    // Assuming existingDeclaration has startDate and endDate.
    // If it uses strings/numbers, convert them to standard Date objects first.
    const start = new Date(existingDeclaration.declerationStartDate);
    const end = new Date(existingDeclaration.declerationEndDate);

    // Calculate how many months span between start and end (inclusive)
    const monthDifference = differenceInCalendarMonths(end, start);

    const contributionData: any[] = [];

    // 4. Loop through each month and each member
    for (let i = 0; i <= monthDifference; i++) {
      const currentMonthDate = addMonths(start, i);
      const year = currentMonthDate.getFullYear();
      const month = currentMonthDate.getMonth() + 1; // 1-indexed (Jan = 1, Dec = 12)
      const dueDate = endOfMonth(currentMonthDate); // Last day of this specific month

      activeMembers
        .filter((m) => m.subscription?.planVersion)
        .forEach((member) => {
          const expectedAmount = member.subscription!.planVersion.amount;

          contributionData.push({
            associationId: association.id, // Fixed missing variable bug
            user: { connect: { id: member.id } },
            userId: member.id,
            year,
            month,
            expectedAmount,
            paidAmount: Prisma.Decimal(0),
            dueAmount: expectedAmount,
            status: ContributionStatus.DUE, // Changed from PAID to PENDING since they haven't paid yet
            dueDate,
          });
        });
    }

    // 5. Bulk insert periods
    if (contributionData.length > 0) {
      await prisma.contributionPeriod.createMany({
        data: contributionData,
        skipDuplicates: true,
      });
    }

    // 6. Return standard success JSON response
    return success(res, {
      data: updatedDeclaration,
      message: 'Declarations successfully approved and contribution periods generated.',
    });
  }),
];

export const rejectDeclarationsHandler: RequestHandler[] = [
  validate({ params: z.object({ id: z.string() }) }),
  asyncHandler(async (req, res) => {
    const declarationId = req.params.id as string;

    const association = await getAssociation(req);

    await withRole(req, UserRole.FINANCE);

    const existingDeclaration = await prisma.declarations.findUnique({
      where: { id: declarationId, associationId: association.id },
    });

    if (!existingDeclaration) throw new NotFoundError('Declaration not found');

    if (existingDeclaration.status === DeclerationStatus.APPROVED) {
      return success(res, {
        data: existingDeclaration,
        message: 'Cannot change approved declaration.',
      });
    }

    if (existingDeclaration.status === DeclerationStatus.REJECTED) {
      return success(res, {
        data: existingDeclaration,
        message: 'Declaration already rejected.',
      });
    }

    const declarations = await prisma.declarations.update({
      where: {
        id: declarationId,
        associationId: association.id,
      },
      data: {
        status: DeclerationStatus.REJECTED,
        reviewBy: req.user?.id,
        reviewAt: new Date(),
      },
    });

    return success(res, {
      data: declarations,
      message: 'Declarations successfully rejected.',
    });
  }),
];
