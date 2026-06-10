// ---- DSAR - My Tickets

// ---- Imports

// ---- External Libraries

import { ForbiddenError, NotFoundError } from '@errors';
// ---- DSAR Services
import { findDsarTickets, findUniqueDsarTicket } from '@feature/dsar/services';
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
// GET /api/dsar/my
// Description: List the current user's DSAR tickets
// Security: Any authenticated user
// ============================================================================

export const listMyTickets: RequestHandler[] = [
  validate({ query: DsarQuerySchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Auth: Resolve association

    // ---- Auth log

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/dsar/my - Request started',
    );

    // ---- Business logic: Fetch current user's tickets

    const userId = req.user?.id as string;

    const result = await findDsarTickets({
      associationId: req.user!.associationId,
      userId,
      filters: {
        status: (req.query as any).status,
        requestType: (req.query as any).requestType,
      },
      pagination: {
        page: (req.query as any).page ?? 1,
      },
    });

    // ---- Result log

    logger.info({ traceId, userId, count: result.tickets.length }, 'GET /api/dsar/my - Success');

    return success(res, { data: result.tickets, meta: result.pagination });
  }),
];

// ============================================================================
// GET /api/dsar/my/:ticketId
// Description: Retrieve a single DSAR ticket owned by the current user
// Security: Requires MEMBER role (or higher)
// ============================================================================

export const getMyTicket = async (req: Request, res: Response, _next: NextFunction) => {
  const traceId = (req.traceId as string) || '';

  // ---- Auth: Resolve association

  // ---- Auth log

  logger.info(
    { traceId, associationId: req.user!.associationId },
    'GET /api/dsar/my/[ticketId] - Request started',
  );

  // ---- Auth: Verify minimum role

  await withRole(req, UserRole.MEMBER);

  // ---- Business logic: Fetch and verify ownership

  const userId = req.user?.id as string;
  const ticketId = req.params.ticketId as string;

  const ticket = await findUniqueDsarTicket(ticketId, req.user!.associationId);

  if (!ticket) throw new NotFoundError('Ticket not found');
  if (ticket.userId !== userId) throw new ForbiddenError('Not authorized to view this ticket');

  // ---- Result log

  logger.info({ traceId, ticketId }, 'GET /api/dsar/my/[ticketId] - Success');

  return success(res, { data: ticket });
};
