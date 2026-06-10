// ---- GET /api/consent/my
// ---- Description: Retrieve the current user's consent state for all purposes.
// ---- Security: MEMBER role or higher

// External libs
import { UnauthorizedError } from '@errors';
// Services
import { ConsentService } from '@feature/consent/services/consent.service';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@utils/async-handler';
// Shared utilities
import { success } from '@utils/responses';
import type { Request, RequestHandler, Response } from 'express';

// ---- Handler

export const getMyConsent: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response) => {
    // ---- Extract tracing context

    const traceId = (req.traceId as string) || '';

    // ---- Auth: verify association membership

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/consent/my - Request started',
    );

    // ---- Auth: verify user has at least MEMBER role

    await withRole(req, UserRole.MEMBER);

    // ---- Resolve the requesting user ID

    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError('User ID not found');

    // ---- Fetch the user's current consent state

    const consentState = await ConsentService.getUserConsentState(userId, req.user!.associationId);

    // ---- Log success and return response

    logger.info({ traceId }, 'GET /api/consent/my - Success');
    return success(res, { data: consentState });
  }),
];
