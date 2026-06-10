// ---- Imports

// ---- DSAR Services
import { UserRole } from '@prisma/client';
import { NotFoundError } from '@src/shared/errors';
import { logger } from '@src/shared/logger';
import { findUnpaginatedUsers } from '@src/shared/services/user/getUsers';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@utils/async-handler';
// ---- Shared Utilities
import { success } from '@utils/responses';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

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

    // ---- Auth log

    logger.info(
      { traceId, associationId: req.user?.associationId, userId: req.user?.id },
      'GET /api/dsar/admins - Request started',
    );

    // ---- Auth: Verify role

    await withRole(req, UserRole.DPO);

    // ---- Business logic: Fetch admins
    if (!req.user?.associationId) throw new NotFoundError('No association ID found');

    const admins = await findUnpaginatedUsers({
      where: {
        associationId: req.user.associationId,
        role: {
          hasSome: [UserRole.DPO, UserRole.PRESIDENT, UserRole.SUPER_ADMIN],
        },
      },
    });

    // ---- Result log
    const users = admins.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    }));

    logger.info({ traceId, count: admins.length }, 'GET /api/dsar/admins - Success');

    return success(res, { data: users });
  }),
];
