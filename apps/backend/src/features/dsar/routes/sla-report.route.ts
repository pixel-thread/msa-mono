// ---- DSAR - SLA Report

// ---- Imports

// ---- External Libraries

import { ForbiddenError, UnauthorizedError } from '@errors';
// ---- DSAR Services
import { getDsarSlaStatus } from '@feature/dsar/services';
import { prisma } from '@lib/prisma';
// ---- Prisma Types
import { UserRole } from '@prisma/client';
// ---- Shared Services
import { findUniqueUser } from '@services/user/get-unique-user';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
// ---- Shared Utilities
import { success } from '@utils/responses';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

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
// GET /api/dsar/sla-report
// Description: Retrieve DSAR SLA compliance report
// Security: Requires DPO role
// ============================================================================

export const getSlaReport: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Auth: Resolve association

    // ---- Auth log

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/dsar/sla-report - Request started',
    );

    // ---- Auth: Verify role

    await withRole(req, UserRole.DPO);

    // ---- Business logic: Fetch SLA report

    const report = await getDsarSlaStatus(req.user!.associationId);

    // ---- Result log

    logger.info({ traceId }, 'GET /api/dsar/sla-report - Success');

    return success(res, { data: report, message: '' });
  }),
];
