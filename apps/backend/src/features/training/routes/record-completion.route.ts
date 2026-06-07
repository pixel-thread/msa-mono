// ---- External libs ----
// ---- Services ----
import { adminRecordCompletion, findManyCompletions } from '@feature/training/services';
// ---- Validators ----
import { AdminRecordCompletionSchema } from '@feature/training/validators/training';
// ---- Shared utilities ----
import { validate } from '@lib/validate';
// ---- Prisma ----
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /training/completions
// Description: List all completions with optional filters (moduleId, userId)
// Security:    SECRETARY role required
// ---------------------------------------------------------------------------

export const getCompletions: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /training/completions - Request started',
    );

    // Authorize: SECRETARY role required (admin view)
    await withRole(req, UserRole.SECRETARY);

    logger.info({ traceId }, 'GET /training/completions - User authorized');

    // Parse optional query filters
    const page = parseInt(req.query.page as string) || 1;
    const moduleId = req.query.moduleId as string | undefined;
    const userId = req.query.userId as string | undefined;

    // Fetch filtered completions
    const data = await findManyCompletions({
      associationId: req.user!.associationId,
      moduleId,
      userId,
      page,
    });

    logger.info({ traceId }, 'GET /training/completions - Success');
    return success(res, { data: data.completions, meta: data.pagination });
  }),
];

// ---------------------------------------------------------------------------
// POST /training/completions
// Description: Admin record a completion for a user
// Security:    SECRETARY role required
// ---------------------------------------------------------------------------

export const postCompletion: RequestHandler[] = [
  validate({ body: AdminRecordCompletionSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /training/completions - Request started',
    );

    // Authorize: SECRETARY role required
    const admin = await withRole(req, UserRole.SECRETARY);

    logger.info({ traceId, userId: admin.id }, 'POST /training/completions - User authorized');

    // Record the completion on behalf of the user
    const completion = await adminRecordCompletion({
      associationId: req.user!.associationId,
      actorId: admin.id,
      data: req.body,
    });

    logger.info({ traceId, completionId: completion.id }, 'POST /training/completions - Success');
    return success(res, { data: completion }, 201);
  }),
];
