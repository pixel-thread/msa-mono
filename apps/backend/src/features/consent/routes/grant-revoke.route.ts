// ---- POST /api/consent/grant | POST /api/consent/revoke
// ---- Description: Grant or withdraw consent for specified purposes.
// ---- Security: Authenticated user (any role)

// External libs
import { BadRequestError, ForbiddenError, UnauthorizedError } from '@errors';
// Services
import { ConsentService } from '@feature/consent/services/consent.service';
// Validators
import { ConsentUpdateSchema } from '@feature/consent/validators/consent.validators';
// Prisma
import { prisma } from '@lib/prisma';
// Shared utilities
import { validate } from '@lib/validate';
import { ConsentStatus } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- POST /api/consent/grant - Grant consent

export const grantConsent: RequestHandler[] = [
  validate({ body: ConsentUpdateSchema.omit({ action: true }) }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // ---- Extract tracing context

    const traceId = (req.traceId as string) || '';

    // ---- Auth: verify association membership

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/consent/grant - Request started',
    );

    // ---- Validate request

    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError('Unauthorized');
    if (!req.body) throw new BadRequestError('Request body is required');

    // ---- Extract request metadata for audit trail

    const ipAddress = (req.headers['x-forwarded-for'] as string) || 'unknown';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    // ---- Persist the consent grant

    const receipts = await ConsentService.updateConsent(
      userId,
      req.user!.associationId,
      { ...req.body, action: ConsentStatus.GRANTED },
      ipAddress,
      userAgent,
    );

    // ---- Log success and return response

    logger.info({ traceId, userId }, 'POST /api/consent/grant - Consent granted successfully');
    return success(res, { message: 'Consent granted successfully', data: receipts });
  }),
];

// ---- POST /api/consent/revoke - Withdraw consent

export const revokeConsent: RequestHandler[] = [
  validate({ body: ConsentUpdateSchema.omit({ action: true }) }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // ---- Extract tracing context

    const traceId = (req.traceId as string) || '';

    // ---- Auth: verify association membership

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/consent/revoke - Request started',
    );

    // ---- Validate request

    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError('Unauthorized');
    if (!req.body) throw new BadRequestError('Request body is required');

    // ---- Extract request metadata for audit trail

    const ipAddress = (req.headers['x-forwarded-for'] as string) || 'unknown';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    // ---- Persist the consent withdrawal

    const receipts = await ConsentService.updateConsent(
      userId,
      req.user!.associationId,
      { ...req.body, action: ConsentStatus.WITHDRAWN },
      ipAddress,
      userAgent,
    );

    // ---- Log success and return response

    logger.info({ traceId, userId }, 'POST /api/consent/revoke - Consent revoked successfully');
    return success(res, { message: 'Consent revoked successfully', data: receipts });
  }),
];
