// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ForbiddenError, NotFoundError, UnauthorizedError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { findFirstMember } from '@feature/members/services/findFirstMember';
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
// Schema — route param identifying the member to fetch
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GET /api/members/:memberId  —  Full member profile including attendance
// Security: requires DPO role
// Business intent: provide a detailed view of a single member's profile data
//   plus a count of meetings they have attended for oversight purposes.
// ---------------------------------------------------------------------------
export const getMember: RequestHandler[] = [
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
      'GET /api/members/[memberId] - Request started',
    );

    await withRole(req, UserRole.DPO);

    logger.info({ traceId, userId: user.id }, 'GET /api/members/[memberId] - User authorized');

    // ── Business logic — fetch full member profile ──────────────────────────
    const params = req.params as MembersParamInput;

    const member = await findFirstMember({
      where: { id: params.memberId, associationId: association.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        membershipNumber: true,
        designation: true,
        mobile: true,
        dateOfJoiningGovt: true,
        dateOfJoiningAssociation: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            meetingAttendances: true,
          },
        },
      },
    });

    if (!member || member.id !== params.memberId) {
      throw new NotFoundError('Member not found');
    }

    // ── Result log & response ───────────────────────────────────────────────
    logger.info({ traceId, memberId: params.memberId }, 'GET /api/members/[memberId] - Success');

    return success(res, { data: member });
  }),
];
