import { NotFoundError } from '@errors';
import { validate } from '@lib/validate';
import { DeclarationStatus, UserRole } from '@prisma/client';
import { hasHighRoleAccess } from '@utils';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import z from 'zod';

import {
  approveDeclaration,
  findDeclarations,
  findUniqueDeclaration,
  rejectDeclaration,
  submitDeclaration,
} from '../services/declarations.service';
import type { CreateUserDeclarationsInput } from '../validators';
import {
  ApproveDeclarationSchema,
  CreateUserDeclarations,
  ListDeclarationsQuerySchema,
  RejectDeclarationSchema,
} from '../validators';

export const createUserDeclarationHandler: RequestHandler[] = [
  validate({ body: CreateUserDeclarations }),
  asyncHandler(async (req, res) => {
    const associationId = req.user?.associationId;
    const user = await withRole(req, UserRole.MEMBER);

    const { amount } = req.body as CreateUserDeclarationsInput;

    const declear = await submitDeclaration(user.id, associationId || '', amount);

    return success(res, {
      data: {
        id: declear.id,
        status: DeclarationStatus.PENDING,
        declerationStartDate: declear.declerationStartDate,
        declerationEndDate: declear.declerationEndDate,
        amount: declear.amount,
      },
      message: 'Declaration submitted successfully.',
    });
  }),
];

export const getDeclarationHandler: RequestHandler[] = [
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
  validate({ query: ListDeclarationsQuerySchema }),
  asyncHandler(async (req, res) => {
    const user = await withRole(req, UserRole.MEMBER);

    const page = req.query.page;
    const status = req.query.status;
    const associationId = req.user?.associationId;

    const where: Record<string, unknown> = { associationId: associationId };

    if (status) where.status = status;

    let result;

    if (hasHighRoleAccess(user.role)) {
      result = await findDeclarations({
        where,
        include: {
          member: { select: { name: true, email: true, mobile: true } },
        },
        page: parseInt(page as string),
      });
    } else {
      where.memberId = user.id;
      result = await findDeclarations({
        where,
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
    const userId = req.user?.id;

    if (!userId) {
      throw new NotFoundError('User not found');
    }

    await withRole(req, UserRole.FINANCE);

    const { declaration, wasAlreadyApproved } = await approveDeclaration(
      declarationId,
      associationId!,
      userId,
      req.body.remark,
    );

    return success(res, {
      data: declaration,
      message: wasAlreadyApproved
        ? 'Declaration already approved.'
        : 'Declarations successfully approved and contribution periods generated.',
    });
  }),
];

export const rejectDeclarationsHandler: RequestHandler[] = [
  validate({ params: z.object({ id: z.string() }), body: RejectDeclarationSchema }),
  asyncHandler(async (req, res) => {
    const declarationId = req.params.id as string;
    const associationId = req.user?.associationId;
    const userId = req.user?.id;

    if (!userId) {
      throw new NotFoundError('User not found');
    }

    await withRole(req, UserRole.FINANCE);

    const { declaration, wasAlreadyRejected } = await rejectDeclaration(
      declarationId,
      associationId!,
      userId,
      req.body.remark,
    );

    return success(res, {
      data: declaration,
      message: wasAlreadyRejected
        ? 'Declaration already rejected.'
        : 'Declarations successfully rejected.',
    });
  }),
];
