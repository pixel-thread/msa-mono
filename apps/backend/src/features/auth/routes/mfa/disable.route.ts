import { BadRequestError, UnauthorizedError } from '@errors';
import { findFirstMember } from '@feature/members/services/findFirstMember';
import { updateMember } from '@feature/members/services/updateMember';
import { verifyPassword } from '@lib/password';
import { validate } from '@lib/validate';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

/** Schema for disabling MFA — requires the user's current password. */
const DisableMfaSchema = z.object({ password: z.string().min(1, 'Password is required') });

/**
 * POST /api/auth/mfa/disable — Disable MFA for the authenticated user
 * Auth: auth middleware required
 *
 * Verifies the user's current password, confirms MFA is currently enabled,
 * then disables it. This is a sensitive operation that requires re-entry of
 * the password to prevent unauthorized disabling.
 */
export const postMfaDisable: RequestHandler[] = [
  validate({ body: DisableMfaSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const userId = req.user?.id as string;
    logger.info({ traceId, userId }, 'POST /api/auth/mfa/disable - Request started');
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const { password } = req.body;

    // ---- Fetch user and check MFA status ----
    const user = await findFirstMember({
      where: { id: userId },
      select: { password: true, mfaEnabled: true },
    });

    if (!user || !user.mfaEnabled) throw new BadRequestError('MFA is not enabled');
    if (!user.password) throw new BadRequestError('Please set a password first');

    // Verify the user's password before allowing MFA to be disabled
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) throw new UnauthorizedError('Invalid password');

    // ---- Disable MFA ----
    await updateMember({ where: { id: userId }, data: { mfaEnabled: false } });

    logger.info({ traceId, userId }, 'POST /api/auth/mfa/disable - Success');
    return success(res, { message: 'MFA disabled successfully', data: { mfaEnabled: false } });
  }),
];
