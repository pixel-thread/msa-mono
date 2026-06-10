// ---- DSAR - List Tickets

// ---- Imports

// ---- External Libraries

import { ForbiddenError, UnauthorizedError } from '@errors';
// ---- DSAR Services
import { findDsarTickets } from '@feature/dsar/services';
// ---- DSAR Validators
import { DsarQuerySchema } from '@feature/dsar/validators';
import { prisma } from '@lib/prisma';
// ---- Shared Utilities
import { validate } from '@lib/validate';
// ---- Prisma Types
import { UserRole } from '@prisma/client';
// ---- Shared Services
import { findUniqueUser } from '@services/user/get-unique-user';
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

/**
 * Verify the requesting user has at minimum the given role.
 * Business logic: Uses a numeric hierarchy where lower values = higher privilege.
 */
async function withRole(req: Request, role: UserRole) {
  const userId = req.user?.id as string;
  if (!userId) throw new UnauthorizedError('Unauthorized');

  const user = await findUniqueUser({ where: { id: userId } });
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
      { traceId, associationId: req.user!.associationId },
      'GET /api/dsar - Request started',
    );

    // ---- Auth: Verify role

    await withRole(req, UserRole.DPO);

    // ---- Business logic: Fetch paginated tickets

    const result = await findDsarTickets({
      associationId: req.user!.associationId,
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
