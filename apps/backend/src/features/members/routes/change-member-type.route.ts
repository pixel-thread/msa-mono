// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { NotFoundError, UnauthorizedError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { updateMember } from '@feature/members/services/updateMember';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { AuditAction, UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { findUniqueUser, logAction } from '@src/shared/services';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

import type { MembersParamInput, UpdateMemberTypeInput } from '../validators';
import { MembersParamSchema, UpdateMemberTypeSchema } from '../validators';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/** Body: the memberTypeId to change. */

// ---------------------------------------------------------------------------
// POST /api/members/:memberId/type —  change memberType to a member
// Security: requires PRESIDENT role
// Business intent: grant additional privileges (e.g. SECRETARY, FINANCE) to a
//   member who already holds a base role.
// ---------------------------------------------------------------------------
export const changeMemberType: RequestHandler[] = [
  validate({ body: UpdateMemberTypeSchema, params: MembersParamSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    const userId = req.user?.id as string;

    await withRole(req, UserRole.SECRETARY);

    if (!userId) throw new UnauthorizedError('Unauthorized');

    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info(
      { traceId, associationId: req.user?.associationId, userId },
      'POST /api/members/[memberId]/type - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    logger.info({ traceId, userId: userId }, 'POST /api/members/[memberId]/type - User authorized');

    // ── Business logic — verify target & change member type ───────────────────────────
    const params = req.params as MembersParamInput;

    const targetMember = await findUniqueUser({
      where: { id: params?.memberId, associationId: req.user?.associationId },
    });

    if (!targetMember) throw new NotFoundError('User does not exist in the association');

    const body = req.body as UpdateMemberTypeInput;

    const memberTypeId = body.memberTypeId;

    const updatedUser = await updateMember({
      where: { id: params?.memberId },
      data: { memberType: { connect: { id: memberTypeId } } },
    });

    await logAction({
      actorId: userId,
      action: AuditAction.UPDATE,
      resourceType: 'MEMBER',
      resourceId: params?.memberId,
      associationId: targetMember?.associationId || '',
      oldValues: { memberTypeId: targetMember?.memberTypeId, connect: true },
      newValues: { memberTypeId: memberTypeId, connect: true },
      traceId,
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info(
      { traceId, memberId: params?.memberId },
      'POST /api/members/[memberId]/type - Success',
    );

    return success(res, { data: updatedUser, message: 'User type updated successfully' });
  }),
];

export const removeMemberType: RequestHandler[] = [
  validate({ body: UpdateMemberTypeSchema, params: MembersParamSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    const userId = req.user?.id as string;

    await withRole(req, UserRole.SECRETARY);

    if (!userId) throw new UnauthorizedError('Unauthorized');

    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info(
      { traceId, associationId: req.user?.associationId, userId },
      'POST /api/members/[memberId]/type - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    logger.info({ traceId, userId: userId }, 'POST /api/members/[memberId]/type - User authorized');

    // ── Business logic — verify target & change member type ───────────────────────────
    const params = req.params as MembersParamInput;

    const targetMember = await findUniqueUser({
      where: { id: params?.memberId, associationId: req.user?.associationId },
    });

    if (!targetMember) throw new NotFoundError('User does not exist in the association');

    const body = req.body as UpdateMemberTypeInput;

    const memberTypeId = body.memberTypeId;

    const updatedUser = await updateMember({
      where: { id: params?.memberId },
      data: { memberType: { disconnect: { id: memberTypeId } } },
    });

    await logAction({
      actorId: userId,
      action: AuditAction.UPDATE,
      resourceType: 'MEMBER',
      resourceId: params?.memberId,
      associationId: targetMember?.associationId || '',
      oldValues: { memberTypeId: targetMember?.memberTypeId, connect: true },
      newValues: { memberTypeId: memberTypeId, connect: false },
      traceId,
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info(
      { traceId, memberId: params?.memberId },
      'POST /api/members/[memberId]/type - Success',
    );

    return success(res, { data: updatedUser, message: 'User type updated successfully' });
  }),
];
