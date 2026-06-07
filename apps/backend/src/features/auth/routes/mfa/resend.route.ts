import { ForbiddenError, NotFoundError, UnauthorizedError } from '@errors';
import { createVerificationCode } from '@feature/auth/services/create-verification-code';
import { getVerificationCodeFirst } from '@feature/auth/services/get-verification-code-first';
import { findFirstMember } from '@feature/members/services/findFirstMember';
import { sendVerificationEmail } from '@lib/email';
import { generateOTP, hashToken } from '@lib/password';
import { validate } from '@lib/validate';
import { env } from '@src/env';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

/**
 * POST /api/auth/mfa/resend — Resend the MFA setup verification code
 * Auth: auth middleware required
 *
 * Validates the user exists, enforces a cooldown period between resends
 * to prevent abuse, then generates a new OTP and persists it as a
 * SETUP_MFA verification code. The code is emailed to the user.
 */
export const postMfaResend: RequestHandler[] = [
  validate({}),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    // ---- Look up user ----
    const user = await findFirstMember({ where: { id: userId }, select: { email: true } });
    if (!user) throw new NotFoundError('User not found');

    // ---- Enforce resend cooldown ----
    const lastCode = await getVerificationCodeFirst({
      where: { userId, type: 'SETUP_MFA', expiresAt: { gt: new Date() }, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (lastCode) {
      const timeSinceLastCode = Date.now() - lastCode.createdAt.getTime();
      const cooldownMs = env.OTP_RESEND_COOLDOWN * 1000;
      if (timeSinceLastCode < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - timeSinceLastCode) / 1000);
        throw new ForbiddenError(
          `Please wait ${remainingSeconds} seconds before requesting a new code`,
        );
      }
    }

    // ---- Generate and persist a new OTP ----
    const otp = generateOTP(env.OTP_LENGTH);
    const hashedOTP = hashToken(otp);
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    await createVerificationCode({
      data: {
        user: { connect: { id: userId } },
        code: hashedOTP,
        type: 'SETUP_MFA',
        expiresAt: otpExpiry,
      },
    });

    // Email the code in production; log it in development for debugging
    if (env.NODE_ENV === 'production') await sendVerificationEmail(user.email, otp, 'SETUP_MFA');
    if (env.NODE_ENV === 'development') logger.debug({ otp }, 'OTP sent to ');

    return success(res, {
      message: 'Verification code sent to your email',
      data: { codeSent: true },
    });
  }),
];
