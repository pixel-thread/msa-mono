// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ForbiddenError, UnauthorizedError, ValidationError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
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

import type { MemberAdminOnboardingInput, MembersParamInput } from '../validators';
import { MemberAdminOnboardingSchema, MembersParamSchema } from '../validators';

/** Request body: fields an admin / secretary may change on a member profile. */
// ---------------------------------------------------------------------------
// PATCH /api/members/:memberId  —  Update a member's profile fields
// Security: requires SECRETARY role
// Business intent: allow secretary-level users to correct or fill in profile
//   data for any member in their association.
// ---------------------------------------------------------------------------
export const updateMemberRoute: RequestHandler[] = [
  validate({ body: MemberAdminOnboardingSchema, params: MembersParamSchema }),
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
      'PATCH /api/members/[memberId] - Request started',
    );

    await withRole(req, UserRole.SECRETARY);

    logger.info({ traceId, userId: user.id }, 'PATCH /api/members/[memberId] - User authorized');

    // ── Validate body & params ──────────────────────────────────────────────
    const body = req.body as MemberAdminOnboardingInput;
    if (!body) {
      throw new ValidationError('Invalid request body');
    }

    const params = req.params as MembersParamInput;
    const memberId = params.memberId;

    // ── Business logic — update only provided fields ────────────────────────
    const updatedUser = await updateMember({
      where: { id: memberId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.mobile && { mobile: body.mobile }),
        ...(body.designation && { designation: body.designation }),
        ...(body.dateOfJoiningGovt && { dateOfJoiningGovt: body.dateOfJoiningGovt }),
        ...(body.dateOfJoiningAssociation && {
          dateOfJoiningAssociation: body.dateOfJoiningAssociation,
        }),
        ...(body.membershipNumber && { membershipNumber: body.membershipNumber }),
        ...(body.associationId && { associationId: body.associationId }),
      },
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info({ traceId, memberId }, 'PATCH /api/members/[memberId] - Success');

    return success(res, {
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        designation: updatedUser.designation,
        membershipNumber: updatedUser.membershipNumber,
        dateOfJoiningGovt: updatedUser.dateOfJoiningGovt,
        dateOfJoiningAssociation: updatedUser.dateOfJoiningAssociation,
      },
    });
  }),
];
