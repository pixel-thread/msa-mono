import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

import { validate } from '@lib/validate';
import { success } from '@utils/responses';
import { asyncHandler } from '@utils/async-handler';
import { logger } from '@src/shared/logger';
import { env } from '@src/env';

import { verifyPassword, hashToken, generateOTP } from '@lib/password';
import { signAccessToken, signRefreshToken, signMfaTempToken } from '@lib/jwt';
import { sendVerificationEmail } from '@lib/email';

import { ForbiddenError, UnauthorizedError } from '@src/shared/errors';

import { getUserFirst } from '@services/user/get-user-first';
import { updateUser } from '@feature/user/services';

import { createRefreshToken } from '@feature/auth/services/create-refresh-token';
import { createVerificationCode } from '@feature/auth/services/create-verification-code';

import { SignInSchema } from '@feature/auth/validators';
import { mockAsyncVerification } from '../utils/mock-async-verification';

/**
 * POST /api/auth/sign-in — Authenticate user with email and password
 * Auth: none (public)
 *
 * Validates credentials, checks for account lockout, handles failed
 * attempt tracking, and either issues tokens (no MFA) or sends an
 * MFA verification code and returns a temp token.
 */

export const postSignIn: RequestHandler[] = [
  validate({ body: SignInSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    logger.info({ traceId }, 'POST /api/auth/sign-in - Request started');
    const user = await getUserFirst({ where: { email: req.body?.email } });
    // check origin
    let isMobile = false;

    const origin = req.headers.origin;
    const deviceType = req.headers['x-device-type'];

    if (deviceType === 'mobile' && !origin) {
      isMobile = true;
    }

    // ---- Handle invalid credentials ----
    if (!user) {
      logger.info({ traceId }, 'POST /api/auth/sign-in - Invalid credentials');
      throw new UnauthorizedError('Invalid credentials');
    }

    // ---- Check account lockout ----
    // If the user has been locked due to too many failed attempts, reject early
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60);
      logger.info(
        { traceId, lockUntil: user.lockedUntil, remainingMinutes, userId: user.id },
        'POST /api/auth/sign-in - Account locked',
      );
      throw new ForbiddenError(`Account is locked. Try again in ${remainingMinutes} minutes`);
    }
    // ---- Verify password ----
    const isPasswordValid = user?.password
      ? await verifyPassword(req.body?.password || '', user.password)
      : await mockAsyncVerification();

    // Handle invalid credentials: increment failed attempts, lock if threshold reached
    if (!isPasswordValid) {
      if (user) {
        const failedAttempts = user.failedLoginAttempts + 1;
        const shouldLock = failedAttempts >= 5;
        logger.info(
          { traceId, failedAttempts, shouldLock, userId: user.id },
          'POST /api/auth/sign-in - Invalid email or password',
        );
        await updateUser({
          where: { id: user.id },
          data: {
            failedLoginAttempts: shouldLock ? 0 : failedAttempts,
            lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null,
          },
        });
        if (shouldLock) {
          logger.info(
            { traceId, failedAttempts, shouldLock, userId: user.id },
            'POST /api/auth/sign-in - Account locked',
          );
          throw new ForbiddenError('Too many failed attempts. Account locked');
        }
      }
      logger.info(
        { traceId, userId: user?.id },
        'POST /api/auth/sign-in - Invalid email or password',
      );
      throw new UnauthorizedError('Invalid credentials');
    }

    // Defensive: should not happen after password check above, but ensures type safety
    if (!user) {
      logger.info(
        { traceId, isPasswordValid: true },
        'POST /api/auth/sign-in - Invalid email or password',
      );
      throw new UnauthorizedError('Invalid credentials');
    }

    // ---- Reset failed attempt counter on successful login ----
    await updateUser({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    // ---- MFA branch — send verification code and return temp token ----
    if (user.mfaEnabled) {
      const otp = generateOTP(env.OTP_LENGTH);
      const hashedOTP = hashToken(otp);
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

      await createVerificationCode({
        data: {
          user: { connect: { id: user.id } },
          code: hashedOTP,
          type: 'LOGIN_MFA',
          expiresAt: otpExpiry,
        },
      });

      // Log OTP in development for debugging; always email in production
      if (env.NODE_ENV === 'development') logger.debug(`OTP: ${otp}`);

      if (env.NODE_ENV === 'production') {
        logger.info(
          { traceId, userId: user.id, mfaEnable: user.mfaEnabled },
          'POST /api/auth/sign-in - MFA Signin email sent',
        );
        await sendVerificationEmail(user.email, otp, 'LOGIN_MFA');
      }

      const mfaTempToken = await signMfaTempToken(user.id);

      res.cookie('mfa_temp_token', mfaTempToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 5 * 60 * 1000,
        path: '/',
      });

      logger.info(
        { traceId, userId: user.id },
        'POST /api/auth/sign-in - MFA verification required',
      );
      return success(res, {
        message: 'MFA verification required',
        data: isMobile ? null : { tempToken: mfaTempToken, mfaRequired: true },
      });
    }

    // ---- Non-MFA branch — issue access and refresh tokens directly ----
    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);
    const hashedRefreshToken = hashToken(refreshToken);
    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await createRefreshToken({
      data: {
        user: { connect: { id: user.id } },
        token: hashedRefreshToken,
        expiresAt: refreshTokenExpiry,
      },
    });

    // Set secure httpOnly cookies for both tokens
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'development' ? 'strict' : 'none',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'development' ? 'strict' : 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return success(res, {
      message: 'Signed in successfully',
      data: isMobile ? null : { access_token: accessToken, refresh_token: refreshToken },
    });
  }),
];
