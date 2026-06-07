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
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

import type { MemberOnboardingInput } from '../validators';
import { MemberOnboardingSchema } from '../validators';

// ---------------------------------------------------------------------------
// POST /api/members/onboarding  —  Complete initial profile setup for the
//   currently-authenticated user
// Security: any authenticated user (self-service)
// Business intent: capture government joining date, association joining date,
//   mobile number and designation that the member did not supply during
//   registration.
// ---------------------------------------------------------------------------
export const onboarding: RequestHandler[] = [
  validate({ body: MemberOnboardingSchema }),
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
      'POST /api/members/onboarding - Request started',
    );

    // Re-check userId (belt-and-suspenders after the prisma call above)
    if (!userId) {
      throw new UnauthorizedError('Unauthorized');
    }

    // ── Validate body ───────────────────────────────────────────────────────
    const body = req.body as MemberOnboardingInput;
    if (!body) {
      throw new ValidationError('Invalid request body');
    }

    // ── Business logic — persist onboarding data ────────────────────────────
    const updatedUser = await updateMember({
      where: { id: userId },
      data: {
        dateOfJoiningGovt: new Date(body.dateOfJoiningGovt),
        dateOfJoiningAssociation: new Date(body.dateOfJoiningAssociation),
        mobile: body.mobile,
        designation: body.designation,
      },
    });

    // ── Result log & response ───────────────────────────────────────────────
    logger.info({ traceId, userId: user.id }, 'POST /api/members/onboarding - Success');

    return success(res, {
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        designation: updatedUser.designation,
        mobile: updatedUser.mobile,
        dateOfJoiningGovt: updatedUser.dateOfJoiningGovt,
        dateOfJoiningAssociation: updatedUser.dateOfJoiningAssociation,
      },
      message: 'Onboarding completed successfully',
    });
  }),
];
