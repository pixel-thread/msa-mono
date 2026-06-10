// ---- DSAR - List Tickets

// ---- Imports

// ---- External Libraries

import { UnauthorizedError } from '@errors';
// ---- DSAR Services
import { findDsarTickets } from '@feature/dsar/services';
// ---- DSAR Validators
import { DsarQuerySchema } from '@feature/dsar/validators';
// ---- Shared Utilities
import { validate } from '@lib/validate';
// ---- Prisma Types
import { UserRole } from '@prisma/client';
// ---- Shared Services
import { logger } from '@src/shared/logger';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Handlers

// ============================================================================
// GET /api/dsar
// Description: List DSAR tickets with optional filters
// Security: Requires DPO role
// ============================================================================

export const listTickets: RequestHandler[] = [
  validate({ query: DsarQuerySchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Auth: Resolve association

    // ---- Auth log

    logger.info(
      { traceId, associationId: req.user?.associationId },
      'GET /api/dsar - Request started',
    );

    // ---- Auth: Verify role

    await withRole(req, UserRole.DPO);

    // ---- Business logic: Fetch paginated tickets

    if (!req.user?.associationId) throw new UnauthorizedError('Unauthorized');

    const result = await findDsarTickets({
      associationId: req.user?.associationId,
      userId: req.query.userId as string | undefined,
      filters: {
        status: (req.query as any).status,
        requestType: (req.query as any).requestType,
      },
      pagination: {
        page: (req.query as any).page ?? 1,
      },
    });

    // ---- Result log

    logger.info({ traceId, count: result.tickets.length }, 'GET /api/dsar - Success');

    return success(res, { data: result.tickets, meta: result.pagination });
  }),
];
