// ---- DSAR - List Admins

// ---- Imports

// ---- External Libraries

import { ForbiddenError,UnauthorizedError } from '@errors';
// ---- DSAR Services
import { findAssociationAdmins } from '@feature/dsar/services';
import { prisma } from '@lib/prisma';
// ---- Prisma Types
import { UserRole } from '@prisma/client';
// ---- Shared Services
import { getUniqueUser } from '@services/user/get-unique-user';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
// ---- Shared Utilities
import { success } from '@utils/responses';
import type { NextFunction, Request, RequestHandler,Response } from 'express';

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
// GET /api/dsar/admins
// Description: List DPO/President/SuperAdmin users in the association
// Security: Requires DPO role
// ============================================================================

export const listAdmins: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Auth: Resolve association

    const association = await getAssociation(req);

    // ---- Auth log

    logger.info(
      { traceId, associationId: association.id },
      'GET /api/dsar/admins - Request started',
    );

    // ---- Auth: Verify role

    await withRole(req, UserRole.DPO);

    // ---- Business logic: Fetch admins

    const admins = await findAssociationAdmins(association.id);

    // ---- Result log

    logger.info({ traceId, count: admins.length }, 'GET /api/dsar/admins - Success');

    return success(res, { data: admins });
  }),
];
