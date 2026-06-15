// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ValidationError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import {
  createPlan,
  getPlan,
  getPlans,
  setDefaultPlan,
  softDeletePlan,
  updatePlan,
} from '@feature/plans/services';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import {
  CreatePlanSchema,
  PlanParamsSchema,
  PlanQuerySchema,
  SetDefaultPlanSchema,
  UpdatePlanSchema,
} from '@feature/plans/validators';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- GET /api/v1/plans ------------------------------------------------------
/** @desc  List plans for the association
 *  @role  MEMBER */
export const getPlansHandler: RequestHandler[] = [
  validate({ query: PlanQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;

    const traceId = (req.traceId as string) || '';
    const user = await withRole(req, UserRole.FINANCE);
    logger.info({ traceId, role: user.role }, 'GET /api/v1/plans - Fetching plans');
    const data = await getPlans(req.user!.associationId, user);
    return success(res, { data });
  }),
];

// ---- POST /api/v1/plans -----------------------------------------------------
/** @desc  Create a new plan with an initial version
 *  @role  SUPER_ADMIN */
export const createPlanHandler: RequestHandler[] = [
  validate({ body: CreatePlanSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    await withRole(req, UserRole.SUPER_ADMIN);
    if (!req.body) throw new ValidationError('Invalid request body');
    logger.info({ traceId, name: req.body.name }, 'Creating new plan');
    const plan = await createPlan(req.user!.associationId, req.body);
    return success(res, { data: plan }, 201);
  }),
];

// ---- POST /api/v1/plans/default ---------------------------------------------
/** @desc  Set a plan as the default for the association
 *  @role  SUPER_ADMIN */
export const setDefaultPlanHandler: RequestHandler[] = [
  validate({ body: SetDefaultPlanSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    await withRole(req, UserRole.SUPER_ADMIN);
    if (!req.body) throw new ValidationError('Invalid request body');
    logger.info({ traceId, planId: req.body.planId }, 'Setting plan as default');
    const updated = await setDefaultPlan(req.user!.associationId, req.body.planId);
    return success(res, { data: updated });
  }),
];

// ---- PATCH /api/v1/plans/:planId --------------------------------------------
/** @desc  Update a plan (creates new version if price changes)
 *  @role  SUPER_ADMIN */
export const updatePlanHandler: RequestHandler[] = [
  validate({ body: UpdatePlanSchema }),

  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    const user = await withRole(req, UserRole.SUPER_ADMIN);

    logger.info({ traceId, userId: user.id }, 'PATCH /api/v1/plans/[planId] - User authorized');

    if (!req.body) throw new ValidationError('Invalid request body');

    const { planId } = req.params;

    const updatedPlan = await updatePlan(req.user!.associationId, planId as string, req.body);

    logger.info({ traceId, planId }, 'Plan updated successfully');

    return success(res, { data: updatedPlan });
  }),
];

// ---- DELETE /api/v1/plans/:planId -------------------------------------------
/** @desc  Soft-delete a plan by setting isActive = false
 *  @role  PRESIDENT */
export const deletePlanHandler: RequestHandler[] = [
  validate({ params: PlanParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const user = await withRole(req, UserRole.PRESIDENT);
    logger.info({ traceId, userId: user.id }, 'DELETE /api/v1/plans/[planId] - User authorized');
    const { planId } = req.params;
    const plan = await softDeletePlan(req.user!.associationId, planId as string);
    logger.info({ traceId, planId }, 'Plan deleted successfully');
    return success(res, { data: plan, message: 'Plan deleted successfully' });
  }),
];

// ---- GET /api/v1/plans/:planId ----------------------------------------------
/** @desc  Get plan details with version history
 *  @role  MEMBER */
export const getPlanDetailsHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    await withRole(req, UserRole.MEMBER);
    const { planId } = req.params;
    const plan = await getPlan(planId as string, req.user!.associationId);
    logger.info({ traceId, planId }, 'GET /api/v1/plans/[planId] - Success');
    return success(res, { data: plan });
  }),
];
