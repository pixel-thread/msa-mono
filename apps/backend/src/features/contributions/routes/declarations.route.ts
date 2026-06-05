import { DeclerationStatus, UserRole } from '@prisma/client';
import { prisma } from '@src/shared/lib';
import { validate } from '@src/shared/lib/validate';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { withRole } from '@src/shared/utils/with-role';
import { RequestHandler } from 'express';
import { success } from '@src/shared/utils/responses';
import z from 'zod';
import { BadRequestError, NotFoundError } from '@src/shared/errors';
import { differenceInCalendarMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { findDeclarations, findUniqueDeclaration } from '../services/declarations.service';
import {
  ApproveDeclarationSchema,
  CreateUserDeclarations,
  CreateUserDeclarationsInput,
  RejectDeclarationSchema,
} from '../validators';
import { hasHighRoleAccess } from '@src/shared/utils';
import { pageNumberValidation } from '@src/shared/validators';

export const createUserDeclarationHandler: RequestHandler[] = [
  validate({ body: CreateUserDeclarations }),
  asyncHandler(async (req, res) => {
    const associationId = req.user?.associationId;
    const user = await withRole(req, UserRole.MEMBER);

    const { amount } = req.body as CreateUserDeclarationsInput;

    const lastDeclaration = await prisma.declarations.findFirst({
      where: {
        memberId: user.id,
        status: 'APPROVED',
      },
      orderBy: { lastDeclarationDate: 'desc' },
      take: 1,
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

    const endDate = endOfMonth(today);

    const declear = await prisma.declarations.create({
      data: {
        memberId: user.id,
        associationId: associationId || '',
        declerationStartDate: startDate,
        declerationEndDate: endDate,
        amount,
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

export const userDeclarationsHandler: RequestHandler[] = [
  validate({ params: z.object({ id: z.string() }) }),
  asyncHandler(async (req, res) => {
    const associationId = req.user?.associationId;
    const declarationId = req.params.id as string;
    const user = await withRole(req, UserRole.MEMBER);

    const declarations = await findUniqueDeclaration({
      where: {
        id: declarationId,
        memberId: user.id,
        associationId: associationId,
      },
      include: {
        reviewer: { select: { name: true, email: true, mobile: true } },
        member: { select: { name: true, email: true, mobile: true } },
      },
    });

    return success(res, {
      data: declarations,
      message: 'Declarations successfully fetch.',
    });
  }),
];

export const listDeclarationsHandler: RequestHandler[] = [
  validate({ query: z.object({ page: pageNumberValidation }) }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.MEMBER);
    const page = req.query.page;

    const associationId = req.user?.associationId;
    let result;

    if (hasHighRoleAccess(user.role)) {
      result = await findDeclarations({
        where: { associationId: associationId },
        include: {
          member: { select: { name: true, email: true, mobile: true } },
        },
        page: parseInt(page as string),
      });
    } else {
      result = await findDeclarations({
        where: { memberId: user.id, associationId: associationId },
        include: {
          member: { select: { name: true, email: true, mobile: true } },
        },
        page: parseInt(page as string),
      });
    }

    return success(res, {
      data: result.declaration,
      meta: result.pagination,
      message: 'Declarations successfully fetch.',
    });
  }),
];

export const approveDeclarationsHandler: RequestHandler[] = [
  validate({ params: z.object({ id: z.string() }), body: ApproveDeclarationSchema }),
  asyncHandler(async (req, res) => {
    const declarationId = req.params.id as string;
    const associationId = req.user?.associationId;

    await withRole(req, UserRole.FINANCE);

    const existingDeclaration = await prisma.declarations.findUnique({
      where: { id: declarationId, associationId: associationId },
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
        associationId: associationId,
      },
      data: {
        status: DeclerationStatus.APPROVED,
        reviewBy: req.user?.id,
        reviewAt: new Date(),
        remark: req.body.remark,
        lastDeclarationDate: endOfMonth(new Date()),
      },
    });

    // 6. Return standard success JSON response
    return success(res, {
      data: updatedDeclaration,
      message: 'Declarations successfully approved and contribution periods generated.',
    });
  }),
];

export const rejectDeclarationsHandler: RequestHandler[] = [
  validate({ params: z.object({ id: z.string() }), body: RejectDeclarationSchema }),
  asyncHandler(async (req, res) => {
    const declarationId = req.params.id as string;

    const associationId = req.user?.associationId;

    await withRole(req, UserRole.FINANCE);

    const existingDeclaration = await prisma.declarations.findUnique({
      where: { id: declarationId, associationId: associationId },
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
        associationId: associationId,
      },
      data: {
        status: DeclerationStatus.REJECTED,
        reviewBy: req.user?.id,
        reviewAt: new Date(),
        remark: req.body.remark,
      },
    });

    return success(res, {
      data: declarations,
      message: 'Declarations successfully rejected.',
    });
  }),
];
