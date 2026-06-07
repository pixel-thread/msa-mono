// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { findUniqueMember } from '@feature/members/services/findUniqueMember';
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

import type { MembersParamInput } from '../validators';
import { MembersParamSchema } from '../validators';

// ---------------------------------------------------------------------------
// POST /api/members/:memberId/suspend  —  Suspend a member's account
// Security: requires PRESIDENT role
// Business intent: allow the association president to immediately disable a
//   member's access when a serious policy violation has been identified.
// ---------------------------------------------------------------------------
export const suspendMember: RequestHandler[] = [
  validate({ params: MembersParamSchema }),
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
      'POST /api/members/[memberId]/suspend - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    logger.info(
      { traceId, userId: user.id },
      'POST /api/members/[memberId]/suspend - User authorized',
    );

    // ── Business logic — verify target & suspend ────────────────────────────
    const params = req.params as MembersParamInput;

    const target = await findUniqueMember({ where: { id: params?.memberId } });
    if (!target) {
      throw new NotFoundError('Member not found');
    }

    // Cross-association guard: prevent suspending a member from another assoc
    if (target.associationId !== association.id) {
      throw new BadRequestError('Member does not belong to this association');
    }

    const updatedMember = await updateMember({
      where: { id: params?.memberId },
      data: { status: 'SUSPENDED' },
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info(
      { traceId, memberId: params?.memberId },
      'POST /api/members/[memberId]/suspend - Success',
    );

    return success(res, { data: updatedMember, message: 'Member suspended successfully' });
  }),
];
