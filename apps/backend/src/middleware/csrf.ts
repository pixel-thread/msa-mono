import { ForbiddenError } from '@errors';
import { generateCsrfToken, verifyCsrfToken } from '@lib/csrf';
import { env } from '@src/env';
import { setCSRFTokenCookie } from '@src/features/auth/utils/helpers';
import { API_PUBLIC_ROUTES } from '@src/shared/constants';
import { logger } from '@src/shared/logger';
import { getTraceId } from '@utils';
import type { NextFunction, Request, Response } from 'express';

export function csrf(req: Request, res: Response, next: NextFunction) {
  const traceId = getTraceId();
  const method = req.method.toUpperCase();
  const path = req.path;
  const authHeader = req.headers.authorization;
  const clearApiPrefix = path.startsWith('/api/v1') ? path.slice(7) : path;

  // skipping csrf check for public routes
  if (API_PUBLIC_ROUTES.some((r) => r === clearApiPrefix) || authHeader?.startsWith('Bearer ')) {
    return next();
  }

  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    if (!req.cookies?.['csrf_token']) {
      const token = generateCsrfToken();
      setCSRFTokenCookie(res, token);
    }
    return next();
  }

  const csrfCookie = req.cookies?.['csrf_token'];

  const csrfHeader = req.headers['x-csrf-token'];

  if (!csrfCookie && !csrfHeader) {
    logger.info({ csrfCookie, csrfHeader, traceId }, 'CSRF cookie and header are not present');
    const token = generateCsrfToken();
    setCSRFTokenCookie(res, token);
    return next(new ForbiddenError('Invalid CSRF token'));
  }

  if (!verifyCsrfToken(csrfHeader as string, csrfCookie)) {
    const token = generateCsrfToken();
    setCSRFTokenCookie(res, token);
    return next(new ForbiddenError('Invalid CSRF token'));
  }

  next();
}
