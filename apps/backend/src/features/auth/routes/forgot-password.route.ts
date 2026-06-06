import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

import { validate } from '@lib/validate';
import { success } from '@utils/responses';
import { asyncHandler } from '@utils/async-handler';
import { logger } from '@src/shared/logger';
import { env } from '@src/env';

import { hashToken } from '@lib/password';
import { signPasswordResetToken } from '@lib/jwt';
import { sendPasswordResetEmail } from '@lib/email';

import { getUserFirst } from '@services/user/get-user-first';
import { updateUser } from '@feature/user/services';

import { ForgotPasswordInput, ForgotPasswordSchema } from '@feature/auth/validators';

/**
 * POST /api/auth/forgot-password — Request a password reset email
 * Auth: none (public)
 *
 * Looks up the user by email, generates a password reset token, stores
 * a hashed copy with an expiry on the user record, and sends the
 * plain-text token to the user's email. Always returns the same message
 * regardless of whether the email exists (to prevent email enumeration).
 */
export const postForgotPassword: RequestHandler[] = [
  validate({ body: ForgotPasswordSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { email } = req.body as ForgotPasswordInput;
    const user = await getUserFirst({ where: { email } });

    // Return generic success even if email is not found, preventing
    // attackers from enumerating valid email addresses
    if (!user) {
      return success(res, { message: 'A reset email will be sent', data: null });
    }

    // ---- Generate and store reset token ----
    const resetToken = await signPasswordResetToken(user.id);
    const hashedToken = hashToken(resetToken);
    const resetExpiry = new Date();
    resetExpiry.setHours(resetExpiry.getHours() + 1);

    await updateUser({
      where: { id: user.id },
      data: { passwordResetToken: hashedToken, passwordResetExpires: resetExpiry },
    });

    // Send the reset email in production; log the token in development
    if (env.NODE_ENV === 'production') {
      await sendPasswordResetEmail(user.email, resetToken);
    }
    if (env.NODE_ENV === 'development') {
      logger.debug({ token: resetToken }, 'Reset password Token');
    }

    return success(res, { message: 'A reset email will be sent', data: null });
  }),
];
