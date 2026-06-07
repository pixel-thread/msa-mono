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
} from '@feature/subscriptions/services';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import {
  CreateSubscriptionPlanSchema,
  UpdatePlanSchema,
  SetDefaultPlanSchema,
  PlanParamsSchema,
} from '@feature/subscriptions/validators';
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
// ---- Schemas ----------------------------------------------------------------

// ---- GET /api/subscriptions/plans -------------------------------------------
/** @desc  List subscription plans for the association
 *  @role  MEMBER */
export const getPlansHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // Authorize user — MEMBER is sufficient to list plans
    const user = await withRole(req, UserRole.MEMBER);
    logger.info({ traceId, role: user.role }, 'GET /api/subscriptions/plans - Fetching plans');

    // Retrieve plans scoped to association and user's role/member-type
    const data = await getPlans(req.user!.associationId, user);

    return success(res, { data });
  }),
];

// ---- POST /api/subscriptions/plans ------------------------------------------
/** @desc  Create a new subscription plan with an initial version
 *  @role  SUPER_ADMIN */
export const createPlanHandler: RequestHandler[] = [
  validate({ body: CreateSubscriptionPlanSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // Authorize user — only SUPER_ADMIN may create plans
    await withRole(req, UserRole.SUPER_ADMIN);

    if (!req.body) throw new ValidationError('Invalid request body');

    logger.info({ traceId, name: req.body.name }, 'Creating new plan');

    // Delegate creation to service (handles transactional plan + version)
    const plan = await createPlan(req.user!.associationId, req.body);

    return success(res, { data: plan }, 201);
  }),
];

// ---- POST /api/subscriptions/plans/default -----------------------------------
/** @desc  Set a plan as the default for the association
 *  @role  SUPER_ADMIN */
export const setDefaultPlanHandler: RequestHandler[] = [
  validate({ body: SetDefaultPlanSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // Authorize user — only SUPER_ADMIN may change the default
    await withRole(req, UserRole.SUPER_ADMIN);

    if (!req.body) throw new ValidationError('Invalid request body');

    logger.info({ traceId, planId: req.body.planId }, 'Setting plan as default');

    const updated = await setDefaultPlan(req.user!.associationId, req.body.planId);

    return success(res, { data: updated });
  }),
];

// ---- PATCH /api/subscriptions/plans/:planId ----------------------------------
/** @desc  Update a subscription plan (creates new version if price changes)
 *  @role  SUPER_ADMIN */
export const updatePlanHandler: RequestHandler[] = [
  validate({ body: UpdatePlanSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // Authorize user — only SUPER_ADMIN may update plans
    const user = await withRole(req, UserRole.SUPER_ADMIN);
    logger.info(
      { traceId, userId: user.id },
      'PATCH /api/subscriptions/plans/[planId] - User authorized',
    );

    if (!req.body) throw new ValidationError('Invalid request body');

    const { planId } = req.params;

    // Apply partial update; price changes trigger a new version
    const updatedPlan = await updatePlan(req.user!.associationId, planId as string, req.body);

    logger.info({ traceId, planId }, 'Plan updated successfully');

    return success(res, { data: updatedPlan });
  }),
];

// ---- DELETE /api/subscriptions/plans/:planId ---------------------------------
/** @desc  Soft-delete a plan by setting isActive = false
 *  @role  PRESIDENT */
export const deletePlanHandler: RequestHandler[] = [
  validate({ params: PlanParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // Authorize user — PRESIDENT role required for deletion
    const user = await withRole(req, UserRole.PRESIDENT);
    logger.info(
      { traceId, userId: user.id },
      'DELETE /api/subscriptions/plans/[planId] - User authorized',
    );

    const { planId } = req.params;

    const plan = await softDeletePlan(req.user!.associationId, planId as string);

    logger.info({ traceId, planId }, 'Plan deleted successfully');

    return success(res, { data: plan, message: 'Plan deleted successfully' });
  }),
];

// ---- GET /api/subscriptions/plans/:planId ----------------------------------
/** @desc  GET a subscription plan details
 *  @role  SUPER_ADMIN */

export const getPlanDetailsHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // Authorize user — only SUPER_ADMIN may update plans
    const user = await withRole(req, UserRole.MEMBER);

    logger.info(
      { traceId, userId: user.id },
      'GET /api/subscriptions/plans/[planId] - User authorized',
    );

    const { planId } = req.params;

    // Apply partial update; price changes trigger a new version
    const plan = await getPlan(planId as string, req.user!.associationId);

    logger.info({ traceId, planId }, 'GET /api/subscriptions/plans/[planId] - Success');

    return success(res, { data: plan });
  }),
];
