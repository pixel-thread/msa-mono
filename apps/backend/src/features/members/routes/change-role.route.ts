// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { findFirstMember } from '@feature/members/services/findFirstMember';
import { updateMember } from '@feature/members/services/updateMember';
import { prisma } from '@lib/prisma';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { AuditAction, UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { logAction } from '@src/shared/services';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

import type { MembersParamInput, UpdateMemberRoleInput } from '../validators';
import { MembersParamSchema, UpdateMemberRoleSchema } from '../validators';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/** Body: the role to add or remove. */

// ---------------------------------------------------------------------------
// POST /api/members/:memberId/role  —  Add a role to a member
// Security: requires PRESIDENT role
// Business intent: grant additional privileges (e.g. SECRETARY, FINANCE) to a
//   member who already holds a base role.
// ---------------------------------------------------------------------------
export const addRole: RequestHandler[] = [
  validate({ body: UpdateMemberRoleSchema, params: MembersParamSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { association: true },
    });
    if (!user || !user.associationId) throw new ForbiddenError('User association not found');

    const association = {
      id: user.association.id,
      slug: user.association.slug,
      name: user.association.name,
    };

    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info(
      { traceId, associationId: association.id },
      'POST /api/members/[memberId]/role - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    logger.info(
      { traceId, userId: user.id },
      'POST /api/members/[memberId]/role - User authorized',
    );

    // ── Business logic — verify target & add role ───────────────────────────
    const params = req.params as MembersParamInput;

    const target = await findFirstMember({
      where: { id: params?.memberId, associationId: association.id },
    });
    if (!target) throw new NotFoundError('User does not exist in the association');

    const userRole = target.role;
    const body = req.body as UpdateMemberRoleInput;
    const newRole = body?.role as UserRole;

    // Idempotency guard: reject if the member already has this role
    if (userRole.includes(newRole)) {
      throw new ConflictError('User already has the role');
    }

    const updatedUser = await updateMember({
      where: { id: params?.memberId },
      data: { role: [...userRole, newRole] },
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info(
      { traceId, memberId: params?.memberId, newRole },
      'POST /api/members/[memberId]/role - Success',
    );

    return success(res, { data: updatedUser, message: 'User role updated successfully' });
  }),
];

// ---------------------------------------------------------------------------
// PUT /api/members/:memberId/role  —  Remove a role from a member
// Security: requires PRESIDENT role
// Business intent: revoke an additional privilege without affecting the
//   member's other roles.
// ---------------------------------------------------------------------------
export const removeRole: RequestHandler[] = [
  validate({ body: UpdateMemberRoleSchema, params: MembersParamSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { association: true },
    });
    if (!user || !user.associationId) throw new ForbiddenError('User association not found');

    const association = {
      id: user.association.id,
      slug: user.association.slug,
      name: user.association.name,
    };

    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info(
      { traceId, associationId: association.id },
      'PUT /api/members/[memberId]/role - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    logger.info({ traceId, userId: user.id }, 'PUT /api/members/[memberId]/role - User authorized');

    // ── Business logic — verify target & remove role ────────────────────────
    const params = req.params as MembersParamInput;

    const target = await findFirstMember({
      where: { id: params?.memberId, associationId: association.id },
    });
    if (!target) throw new NotFoundError('User does not exist in the association');

    const userRole = target.role;
    const body = req.body as UpdateMemberRoleInput;
    const removeRoleVal = body?.role as UserRole;

    // Safety guard: prevent removing a role the member does not hold
    if (!userRole.includes(removeRoleVal)) {
      throw new ConflictError('User does not have the role');
    }

    const updatedUser = await updateMember({
      where: { id: params?.memberId },
      data: { role: userRole.filter((role) => role !== removeRoleVal) },
    });

    await logAction({
      actorId: userId,
      action: AuditAction.UPDATE,
      resourceType: 'MEMBER',
      resourceId: params?.memberId,
      associationId: target?.associationId || '',
      oldValues: { role: target?.role },
      newValues: { role: userRole },
      traceId,
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info(
      { traceId, memberId: params?.memberId, removeRole: removeRoleVal },
      'PUT /api/members/[memberId]/role - Success',
    );

    return success(res, { data: updatedUser, message: 'User role updated successfully' });
  }),
];
