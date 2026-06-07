// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@errors';
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
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

import { MembersParamSchema, UpdateMembersStatusSchema } from '../validators';
import type { MembersParamInput, UpdateMembersStatusInput } from '../validators/';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

/** Body: which status to apply. */

// ---------------------------------------------------------------------------
// PATCH /api/members/:memberId/status  —  Change a member's status
// Security: requires PRESIDENT role
// Business intent: allow the president to activate, deactivate, or otherwise
//   update the membership status of any user in their association.
// ---------------------------------------------------------------------------
export const updateStatus: RequestHandler[] = [
  validate({ body: UpdateMembersStatusSchema, params: MembersParamSchema }),
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
      'PATCH /api/members/[memberId]/status - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    logger.info(
      { traceId, userId: user.id },
      'PATCH /api/members/[memberId]/status - User authorized',
    );

    // ── Validate params ─────────────────────────────────────────────────────
    const params = req.params as MembersParamInput;
    const memberId = params.memberId;
    if (!memberId) throw new UnauthorizedError('Unauthorized');

    // ── Business logic — verify target exists in assoc, then update status ──
    const target = await findFirstMember({
      where: { id: memberId, associationId: association.id },
    });
    if (!target) throw new NotFoundError('User does not exist in the association');

    const body = req.body as UpdateMembersStatusInput;
    const updatedUser = await updateMember({
      where: { id: memberId },
      data: { status: body?.status },
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info(
      { traceId, memberId, status: body?.status },
      'PATCH /api/members/[memberId]/status - Success',
    );

    return success(res, { data: updatedUser, message: 'User status updated successfully' });
  }),
];
