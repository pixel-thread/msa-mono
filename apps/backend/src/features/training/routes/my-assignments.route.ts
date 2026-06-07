// ---- External libs ----
// ---- Services ----
import { findUserAssignments, findUserCompletions } from '@feature/training/services';
// ---- Prisma ----
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
// ---- Shared utilities ----
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /training/my-assignments
// Description: Retrieve the current user's training assignments
// Security:    MEMBER role required
// ---------------------------------------------------------------------------

export const getMyAssignments: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /training/my-assignments - Request started',
    );

    // Authorize: minimum MEMBER role
    const user = await withRole(req, UserRole.MEMBER);

    logger.info({ traceId, userId: user.id }, 'GET /training/my-assignments - User authorized');

    // Fetch user's assignments
    const page = parseInt(req.query.page as string) || undefined;
    const assignments = await findUserAssignments({
      userId: user.id,
      associationId: req.user!.associationId,
      page,
    });

    logger.info({ traceId }, 'GET /training/my-assignments - Success');
    return success(res, { data: assignments.assignments, meta: assignments.pagination });
  }),
];

// ---------------------------------------------------------------------------
// GET /training/my-completions
// Description: Retrieve the current user's training completions
// Security:    MEMBER role required
// ---------------------------------------------------------------------------

export const getMyCompletions: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /training/my-completions - Request started',
    );

    // Authorize: minimum MEMBER role
    const user = await withRole(req, UserRole.MEMBER);

    logger.info({ traceId, userId: user.id }, 'GET /training/my-completions - User authorized');

    // Fetch user's completions
    const page = parseInt(req.query.page as string) || undefined;
    const completions = await findUserCompletions({
      userId: user.id,
      associationId: req.user!.associationId,
      page,
    });

    logger.info({ traceId }, 'GET /training/my-completions - Success');
    return success(res, { data: completions.module, meta: completions.pagination });
  }),
];
