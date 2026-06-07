// ---- External libs ----
import { BadRequestError } from '@errors';
// ---- Services ----
import {
  assignTraining,
  bulkAssignTraining,
  bulkRemoveTrainingAssignment,
  getAssignedUsers,
  getTrainingAssignments,
  removeTrainingAssignment,
} from '@feature/training/services';
// ---- Validators ----
import {
  AssignTrainingSchema,
  BulkAssignTrainingSchema,
  BulkRemoveAssignSchema,
  RemoveAssignSchema,
  TrainingModuleParamsSchema,
} from '@feature/training/validators/training';
// ---- Shared utilities ----
import { validate } from '@lib/validate';
// ---- Prisma ----
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { buildPagination } from '@src/shared/utils/helper/build-pagination';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /training/modules/:moduleId/assign
// Description: List assignments for a module
// Security:    SECRETARY role required
// ---------------------------------------------------------------------------

export const getAssignments: RequestHandler[] = [
  validate({ params: TrainingModuleParamsSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /training/modules/{moduleId}/assign - Request started',
    );

    // Authorize: SECRETARY role required
    await withRole(req, UserRole.SECRETARY);

    logger.info({ traceId }, 'GET /training/modules/{moduleId}/assign - User authorized');

    // Fetch paginated assignments
    const page = parseInt(req.query.page as string) || 1;
    const result = await getTrainingAssignments({
      associationId: req.user!.associationId,
      moduleId: req.params.moduleId as string,
      page,
    });

    logger.info({ traceId }, 'GET /training/modules/{moduleId}/assign - Success');
    return success(res, { data: result.data, meta: buildPagination(result.total, page) });
  }),
];

// ---------------------------------------------------------------------------
// POST /training/modules/:moduleId/assign
// Description: Assign a user to a module
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const postAssign: RequestHandler[] = [
  validate({ params: TrainingModuleParamsSchema, body: AssignTrainingSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /training/modules/{moduleId}/assign - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'POST /training/modules/{moduleId}/assign - User authorized',
    );

    // Perform the assignment
    try {
      const assignment = await assignTraining({
        associationId: req.user!.associationId,
        moduleId: req.params.moduleId as string,
        userId: req.body.userId,
        assignedById: user.id,
      });

      logger.info(
        { traceId, userId: req.body.userId },
        'POST /training/modules/{moduleId}/assign - Success',
      );
      return success(res, { data: assignment }, 201);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestError(error.message);
      throw new BadRequestError('Failed to assign training');
    }
  }),
];

// ---------------------------------------------------------------------------
// PUT /training/modules/:moduleId/assign
// Description: Bulk assign users to a module
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const putBulkAssign: RequestHandler[] = [
  validate({ params: TrainingModuleParamsSchema, body: BulkAssignTrainingSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'PUT /training/modules/{moduleId}/assign - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'PUT /training/modules/{moduleId}/assign - User authorized',
    );

    // Perform bulk assignment
    try {
      const result = await bulkAssignTraining({
        associationId: req.user!.associationId,
        moduleId: req.params.moduleId as string,
        userIds: req.body.userIds,
        assignedById: user.id,
      });

      logger.info(
        { traceId, userCount: req.body.userIds.length },
        'PUT /training/modules/{moduleId}/assign - Success',
      );
      return success(res, { data: result }, 201);
    } catch (error) {
      if (error instanceof Error) throw new BadRequestError(error.message);
      throw new BadRequestError('Failed to bulk assign training');
    }
  }),
];

// ---------------------------------------------------------------------------
// DELETE /training/modules/:moduleId/assign
// Description: Remove a user assignment
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const deleteAssignment: RequestHandler[] = [
  validate({ params: TrainingModuleParamsSchema, body: RemoveAssignSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'DELETE /training/modules/{moduleId}/assign - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'DELETE /training/modules/{moduleId}/assign - User authorized',
    );

    // Remove the assignment
    try {
      const result = await removeTrainingAssignment({
        associationId: req.user!.associationId,
        moduleId: req.params.moduleId as string,
        userId: req.body.userId,
        removedById: user.id,
      });

      logger.info(
        { traceId, userId: req.body.userId },
        'DELETE /training/modules/{moduleId}/assign - Success',
      );
      return success(res, { data: result });
    } catch (error) {
      if (error instanceof Error) throw new BadRequestError(error.message);
      throw new BadRequestError('Failed to remove training assignment');
    }
  }),
];

// ---------------------------------------------------------------------------
// PATCH /training/modules/:moduleId/assign
// Description: Bulk remove user assignments
// Security:    DPO role required
// ---------------------------------------------------------------------------

export const patchBulkRemove: RequestHandler[] = [
  validate({ params: TrainingModuleParamsSchema, body: BulkRemoveAssignSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'PATCH /training/modules/{moduleId}/assign - Request started',
    );

    // Authorize: DPO role required
    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id },
      'PATCH /training/modules/{moduleId}/assign - User authorized',
    );

    // Perform bulk removal
    try {
      const result = await bulkRemoveTrainingAssignment({
        associationId: req.user!.associationId,
        moduleId: req.params.moduleId as string,
        userIds: req.body.userIds,
        removedById: user.id,
      });

      logger.info(
        { traceId, userCount: req.body.userIds.length },
        'PATCH /training/modules/{moduleId}/assign - Success',
      );
      return success(res, { data: result });
    } catch (error) {
      if (error instanceof Error) throw new BadRequestError(error.message);
      throw new BadRequestError('Failed to bulk remove training assignments');
    }
  }),
];

// ---------------------------------------------------------------------------
// GET /training/modules/:moduleId/assigned-users
// Description: List assigned users with completion status
// Security:    SECRETARY role required
// ---------------------------------------------------------------------------

export const getAssignedUsersHandler: RequestHandler[] = [
  validate({ params: TrainingModuleParamsSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // Resolve association
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /training/modules/{moduleId}/assigned-users - Request started',
    );

    // Authorize: SECRETARY role required
    await withRole(req, UserRole.SECRETARY);

    logger.info({ traceId }, 'GET /training/modules/{moduleId}/assigned-users - User authorized');

    // Fetch paginated assigned users with completion data
    const page = parseInt(req.query.page as string) || 1;
    const result = await getAssignedUsers({
      associationId: req.user!.associationId,
      moduleId: req.params.moduleId as string,
      page,
    });

    logger.info({ traceId }, 'GET /training/modules/{moduleId}/assigned-users - Success');
    return success(res, { data: result.data, meta: buildPagination(result.total, page) });
  }),
];
