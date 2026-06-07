import { updateRefreshTokens } from '@feature/auth/services/update-refresh-tokens';
import { SignOutSchema } from '@feature/auth/validators';
import { hashToken } from '@lib/password';
import { validate } from '@lib/validate';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import { NextFunction, Request, Response } from 'express';

/**
 * POST /api/auth/logout — Revoke the current refresh token and clear auth cookies
 * Auth: auth middleware required
 *
 * Revokes the refresh token in the database and clears the access_token
 * and refresh_token cookies from the client's browser.
 */
export const postLogout: RequestHandler[] = [
  validate({ body: SignOutSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    logger.info({ traceId }, 'POST /api/auth/logout - Request started');
    const bodyToken = req.body?.token || req.cookies?.refresh_token;

    // Revoke the token if one was provided (prevents future use)
    if (bodyToken) {
      const hashedToken = hashToken(bodyToken);
      await updateRefreshTokens({
        where: { token: hashedToken },
        data: { revokedAt: new Date() },
      });
    }

    // Clear both auth cookies from the browser regardless
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });

    logger.info({ traceId }, 'POST /api/auth/logout - Success');
    return success(res, { message: 'Logged out successfully', data: null });
  }),
];
