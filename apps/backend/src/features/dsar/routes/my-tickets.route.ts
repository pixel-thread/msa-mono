// ---- DSAR - My Tickets

// ---- Imports

// ---- External Libraries

import { ForbiddenError, NotFoundError,UnauthorizedError } from '@errors';
// ---- DSAR Services
import { findDsarTickets, findUniqueDsarTicket } from '@feature/dsar/services';
// ---- DSAR Validators
import { DsarQuerySchema } from '@feature/dsar/validators';
import { prisma } from '@lib/prisma';
// ---- Shared Utilities
import { validate } from '@lib/validate';
// ---- Prisma Types
import { UserRole } from '@prisma/client';
// ---- Shared Services
import { getUniqueUser } from '@services/user/get-unique-user';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Role Hierarchy

// Lower number = higher privilege
const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 0,
  PRESIDENT: 1,
  SECRETARY: 2,
  FINANCE: 3,
  DPO: 4,
  MEMBER: 5,
};

// ---- Helpers

/**
 * Resolve the association context from the authenticated user's request.
 * Business logic: Every DSAR ticket is scoped to the user's association.
 */
async function getAssociation(req: Request) {
  const userId = req.user?.id as string;
  if (!userId) throw new UnauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { association: true },
  });

  if (!user || !user.associationId) throw new ForbiddenError('User association not found');

  return { id: user.association.id, slug: user.association.slug, name: user.association.name };
}

/**
 * Verify the requesting user has at minimum the given role.
 * Business logic: Uses a numeric hierarchy where lower values = higher privilege.
 */
async function withRole(req: Request, role: UserRole) {
  const userId = req.user?.id as string;
  if (!userId) throw new UnauthorizedError('Unauthorized');

  const user = await getUniqueUser({ where: { id: userId } });
  if (!user) throw new UnauthorizedError('Unauthorized');

  const roles = user.role as UserRole[];
  const highestUserRole = roles.reduce((highest, current) =>
    ROLE_HIERARCHY[current] < ROLE_HIERARCHY[highest] ? current : highest,
  );

  const hasPermission = ROLE_HIERARCHY[highestUserRole] <= ROLE_HIERARCHY[role];
  if (!hasPermission) throw new ForbiddenError('Permission denied');

  return { ...user, role: roles };
}

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

    const association = await getAssociation(req);

    // ---- Auth log

    logger.info({ traceId, associationId: association.id }, 'GET /api/dsar/my - Request started');

    // ---- Business logic: Fetch current user's tickets

    const userId = req.user?.id as string;

    const result = await findDsarTickets({
      associationId: association.id,
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

  const association = await getAssociation(req);

  // ---- Auth log

  logger.info(
    { traceId, associationId: association.id },
    'GET /api/dsar/my/[ticketId] - Request started',
  );

  // ---- Auth: Verify minimum role

  await withRole(req, UserRole.MEMBER);

  // ---- Business logic: Fetch and verify ownership

  const userId = req.user?.id as string;
  const ticketId = req.params.ticketId as string;

  const ticket = await findUniqueDsarTicket(ticketId, association.id);

  if (!ticket) throw new NotFoundError('Ticket not found');
  if (ticket.userId !== userId) throw new ForbiddenError('Not authorized to view this ticket');

  // ---- Result log

  logger.info({ traceId, ticketId }, 'GET /api/dsar/my/[ticketId] - Success');

  return success(res, { data: ticket });
};
