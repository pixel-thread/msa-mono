// External libs
import { UnauthorizedError } from '@errors';
// ---- Services
import { getUser, updateUser } from '@feature/user/services';
import { logger } from '@src/shared/logger';
// Shared utilities
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// POST /api/user/mfa
// Toggle multi-factor authentication on / off for the authenticated user.
// Security: auth (applied at router level) — any authenticated user can
//           manage their own MFA setting.
// ---------------------------------------------------------------------------

export const toggleMfa: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // ---- Setup

    const traceId = (req.traceId as string) || '';
    logger.info({ traceId }, 'POST /api/user/mfa - Request started');

    // ---- Authorize

    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError('User not found');

    // ---- Fetch current user

    const user = await getUser({ id: userId });
    if (!user) throw new UnauthorizedError('User not found');

    // ---- Toggle MFA state

    // Invert the current MFA setting so a single call always flips the
    // state — enabling if currently disabled, disabling if currently enabled.
    const mfaEnabled = !user.mfaEnabled;

    // ---- Persist update

    await updateUser({
      where: { id: userId },
      data: { mfaEnabled },
    });

    // ---- Log success & respond

    logger.info({ traceId, userId, mfaEnabled }, 'POST /api/user/mfa - Success');
    return success(res, {
      data: { mfaEnable: mfaEnabled },
      message: 'MFA updated successfully',
    });
  }),
];
