// ---- DSAR - Submit Ticket

// ---- Imports

// ---- External Libraries

import { ForbiddenError, UnauthorizedError } from '@errors';
// ---- DSAR Services
import { submitDsarTicket } from '@feature/dsar/services';
// ---- DSAR Validators
import { SubmitDsarSchema } from '@feature/dsar/validators';
import { prisma } from '@lib/prisma';
// ---- Shared Utilities
import { validate } from '@lib/validate';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Handlers

// ============================================================================
// POST /api/dsar/submit
// Description: Submit a new DSAR ticket
// Security: Any authenticated user
// ============================================================================

export const submitDsar: RequestHandler[] = [
  validate({ body: SubmitDsarSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Auth: Resolve association

    // ---- Auth log

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/dsar/submit - Request started',
    );

    // ---- Business logic: Create DSAR ticket

    const userId = req.user?.id as string;

    const ticket = await submitDsarTicket({
      associationId: req.user!.associationId,
      userId,
      data: req.body,
    });

    // ---- Result log

    logger.info({ traceId, userId, ticketId: ticket.id }, 'POST /api/dsar/submit - Success');

    return success(res, { data: ticket }, 201);
  }),
];
