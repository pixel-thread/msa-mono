import { Request, Response, NextFunction } from 'express';
import { generateCsrfToken, verifyCsrfToken } from '@src/shared/lib/csrf';
import { ForbiddenError } from '@src/shared/errors';
import { env } from '@src/env';
import { logger } from '@src/shared/logger';
import { getTraceId } from '@src/shared/utils';

export function csrf(req: Request, res: Response, next: NextFunction) {
  const traceId = getTraceId();
  const method = req.method.toUpperCase();
  const path = req.path;
  const authHeader = req.headers.authorization;
  const clientType = req.headers['x-client-type'];

  const isPublicPath = path.startsWith('/auth');

  // skipping csrf check for public routes and auth routes also for mobile
  if (isPublicPath || authHeader?.startsWith('Bearer ') || clientType === 'mobile') {
    return next();
  }

  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = generateCsrfToken();
    res.cookie('csrf-token', token, {
      httpOnly: false,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    return next();
  }

  const csrfCookie = req.cookies?.['csrf-token'];

  const csrfHeader = req.headers['x-csrf-token'] as string | undefined;

  console.log({ csrfCookie, csrfHeader, traceId }, 'CSRF cookie and header are present');

  if (!csrfCookie && !csrfHeader) {
    logger.info({ csrfCookie, csrfHeader, traceId }, 'CSRF cookie and header are not present');
    return next(new ForbiddenError('Invalid CSRF token'));
  }
  const isSameCsrf = csrfCookie === csrfHeader;

  if (!isSameCsrf) {
    return next(new ForbiddenError('Invalid CSRF token'));
  }

  if (!csrfCookie || !csrfHeader || !verifyCsrfToken(csrfHeader, csrfCookie)) {
    return next(new ForbiddenError('Invalid or missing CSRF token'));
  }

  next();
}
