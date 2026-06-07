// ---- External libs ----
import { NotFoundError } from '@errors';
// ---- Services ----
import { deleteModule, findUniqueModule, updateModule } from '@feature/training/services';
// ---- Validators ----
import { UpdateTrainingModuleSchema } from '@feature/training/validators/training';
// ---- Shared utilities ----
import { validate } from '@lib/validate';
// ---- Prisma ----
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';
// ---- External libs ----
import { z } from 'zod';

// ---- Schema ----

/** Schema for training module ID path parameter. */
const TrainingParamsSchema = z.object({
  moduleId: z.uuid('Invalid module ID'),
});

// ---------------------------------------------------------------------------
// GET /training/modules/:moduleId
// Description: Retrieve a single training module
// Security:    MEMBER role required
// ---------------------------------------------------------------------------

export const getModule: RequestHandler[] = [
  validate({ params: TrainingParamsSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'GET /training/modules/{moduleId} - Request started',
    );

    // Authorize: minimum MEMBER role
    await withRole(req, UserRole.MEMBER);

    logger.info({ traceId }, 'GET /training/modules/{moduleId} - User authorized');

    // Fetch the module (includes certificate template)
    const trainingModule = await findUniqueModule({
      associationId: association.id,
      moduleId: req.params.moduleId as string,
    });

    if (!trainingModule) throw new NotFoundError('Training module not found');

    logger.info(
      { traceId, moduleId: req.params.moduleId },
      'GET /training/modules/{moduleId} - Success',
    );
    return success(res, { data: trainingModule });
  }),
];

// ---------------------------------------------------------------------------
// PATCH /training/modules/:moduleId
// Description: Update a training module
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const updateModuleHandler: RequestHandler[] = [
  validate({ params: TrainingParamsSchema, body: UpdateTrainingModuleSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'PATCH /training/modules/{moduleId} - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'PATCH /training/modules/{moduleId} - User authorized',
    );

    // Apply the update
    const trainingModule = await updateModule({
      associationId: association.id,
      moduleId: req.params.moduleId as string,
      actorId: user.id,
      data: req.body,
    });

    logger.info(
      { traceId, moduleId: req.params.moduleId },
      'PATCH /training/modules/{moduleId} - Success',
    );
    return success(res, { data: trainingModule });
  }),
];

// ---------------------------------------------------------------------------
// DELETE /training/modules/:moduleId
// Description: Delete a training module
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const deleteModuleHandler: RequestHandler[] = [
  validate({ params: TrainingParamsSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'DELETE /training/modules/{moduleId} - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'DELETE /training/modules/{moduleId} - User authorized',
    );

    // Perform the deletion
    await deleteModule({
      associationId: association.id,
      moduleId: req.params.moduleId as string,
      actorId: user.id,
    });

    logger.info(
      { traceId, moduleId: req.params.moduleId },
      'DELETE /training/modules/{moduleId} - Success',
    );
    return success(res, { data: { success: true } });
  }),
];
