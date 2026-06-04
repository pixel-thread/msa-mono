// ---------------------------------------------------------------------------
// ENDPOINT:  CRUD /api/payments/contributions
// SECURITY:  Requires FINANCE role (except where noted)
// PURPOSE:   Manage contribution periods — list, generate monthly records,
//            waive individual periods, and view a single period by ID.
// ---------------------------------------------------------------------------

import { type Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

import { validate } from '@src/shared/lib/validate';
import { success } from '@src/shared/utils/responses';
import { buildPagination } from '@src/shared/utils/build-pagination';
import { logger } from '@src/shared/logger';
import { withRole } from '@src/shared/utils/with-role';
import { NotFoundError } from '@src/shared/errors';
import { UserRole, ContributionStatus } from '@prisma/client';
import { z } from 'zod';
import {
  GenerateContributionsSchema,
  GenerateUserContributionsSchema,
  UserContributionsParamsSchema,
  WaiveContributionSchema,
} from '@src/features/contributions/validators';
import {
  generateMonthlyContributions,
  generateUserMonthlyContributions,
  markOverdueContributions,
  waiveContribution,
} from '@src/features/contributions/services/contribution.service';
import { findContributionPeriods } from '@src/features/contributions/services/find-contribution-periods';
import { findUniqueContributionPeriod } from '@src/features/contributions/services/find-unique-contribution-period';
import { pageNumberValidation } from '@src/shared/validators/common';
import { PAGE_SIZE } from '@src/shared/constants';
import { asyncHandler } from '@src/shared/utils/async-handler';
import { getAssociation } from '@src/shared/services/association/get-association';

// ---- Validation schemas ----

const ContributionsQuerySchema = z.object({
  page: pageNumberValidation,
  status: z.enum(Object.values(ContributionStatus) as [string, ...string[]]).optional(),
  userId: z.uuid().optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

const ContributionIdParamsSchema = z.object({
  contributionId: z.uuid('Invalid contribution ID'),
});

// ---- Helpers ----

// ===========================================================================
// LIST /api/payments/contributions
// ===========================================================================

export const listContributions: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: ContributionsQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId, query: req.query }, 'GET /api/payments/contributions - Request started');

    // --- Auth: resolve association ---
    const association = await getAssociation(req);

    // --- Auth: enforce FINANCE role ---
    // Only finance officers can view the full contributions list
    await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'GET /api/payments/contributions - User authorized');

    // --- Business logic: build filters and fetch ---
    const page = (req.query as any)?.page || 1;

    const { status, userId: filterUserId, year, month } = req.query;

    const where: Record<string, unknown> = { associationId: association.id };
    if (status) where.status = status;
    if (filterUserId) where.userId = filterUserId;
    if (year) where.year = year;
    if (month) where.month = month;

    const { contributions, total } = await findContributionPeriods({
      where: where as Parameters<typeof findContributionPeriods>[0]['where'],
      page,
      pageSize: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true, membershipNumber: true } },
        allocations: {
          include: {
            paymentTransaction: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                paidAt: true,
                receiptNumber: true,
              },
            },
          },
        },
      },
    });

    // --- Log: success ---
    logger.info(
      { traceId, count: contributions.length },
      'GET /api/payments/contributions - Success',
    );

    // --- Response ---
    return success(res, { data: contributions, meta: buildPagination(total, page) });
  }),
];

// ===========================================================================
// GENERATE /api/payments/contributions
// ===========================================================================

export const generateUserContributionsHandler: RequestHandler[] = [
  // Step 1: Validate request body
  validate({ body: GenerateUserContributionsSchema, params: UserContributionsParamsSchema }),
  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const userId = req.params.userId as string;

    // --- Log: request started ---
    logger.info(
      { traceId, year: req.body.year, month: req.body.month },
      'POST /api/payments/contributions - Request started',
    );

    // --- Auth: resolve association ---
    const association = await getAssociation(req);

    // --- Auth: enforce FINANCE role ---
    await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'POST /api/payments/contributions - User authorized');

    // --- Business logic: generate monthly contributions ---
    logger.info(
      { traceId, year: req.body.year, months: req.body.months },
      'POST /api/payments/contributions - Generating contributions',
    );

    const count = await generateUserMonthlyContributions(userId, req.body.year, req.body.months);

    const overdueCount = await markOverdueContributions(association.id, userId);

    // --- Log: success ---
    logger.info(
      { traceId, generated: count, markedOverdue: overdueCount },
      'POST /api/payments/contributions - Success',
    );

    // --- Response ---
    return success(
      res,
      {
        data: { generated: count, markedOverdue: overdueCount },
        message: `Generated ${count} contribution records, marked ${overdueCount} as overdue`,
      },
      201,
    );
  }),
];

export const generateContributions: RequestHandler[] = [
  // Step 1: Validate request body
  validate({ body: GenerateContributionsSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, year: req.body.year, month: req.body.month },
      'POST /api/payments/contributions - Request started',
    );

    // --- Auth: resolve association ---
    const association = await getAssociation(req);

    // --- Auth: enforce FINANCE role ---
    await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'POST /api/payments/contributions - User authorized');

    // --- Business logic: generate monthly contributions ---
    logger.info(
      { traceId, year: req.body.year, months: req.body.months },
      'POST /api/payments/contributions - Generating contributions',
    );

    const count = await generateMonthlyContributions(
      association.id,
      req.body.year,
      req.body.months,
    );

    const overdueCount = await markOverdueContributions(association.id);

    // --- Log: success ---
    logger.info(
      { traceId, generated: count, markedOverdue: overdueCount },
      'POST /api/payments/contributions - Success',
    );

    // --- Response ---
    return success(
      res,
      {
        data: { generated: count, markedOverdue: overdueCount },
        message: `Generated ${count} contribution records, marked ${overdueCount} as overdue`,
      },
      201,
    );
  }),
];

// ===========================================================================
// WAIVE PATCH /api/payments/contributions
// ===========================================================================

export const waiveContributionHandler: RequestHandler[] = [
  // Step 1: Validate request body
  validate({ body: WaiveContributionSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, contributionPeriodId: req.body.contributionPeriodId },
      'PATCH /api/payments/contributions - Request started',
    );

    // --- Auth: resolve association ---
    await getAssociation(req);

    // --- Auth: enforce FINANCE role ---
    // Waiving contributions is a financial decision — restricted to finance
    const user = await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'PATCH /api/payments/contributions - User authorized');

    // --- Business logic: waive the contribution period ---
    const waived = await waiveContribution(req.body.contributionPeriodId, req.body.reason, user.id);

    // --- Log: success ---
    logger.info(
      { traceId, contributionPeriodId: req.body.contributionPeriodId },
      'PATCH /api/payments/contributions - Success',
    );

    // --- Response ---
    return success(res, { data: waived, message: 'Contribution period waived successfully' }, 200);
  }),
];

// ===========================================================================
// GET /api/payments/contributions/:contributionId
// ===========================================================================

export const getContribution: RequestHandler[] = [
  // Step 1: Validate path params
  validate({ params: ContributionIdParamsSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info(
      { traceId, contributionId: req.params.contributionId },
      'GET /api/payments/contributions/[contributionId] - Request started',
    );

    // --- Auth: resolve association ---
    const association = await getAssociation(req);

    // --- Business logic: fetch single contribution period ---
    const contribution = await findUniqueContributionPeriod({
      where: { id: req.params.contributionId as string, associationId: association.id },
      include: {
        user: { select: { id: true, name: true, email: true, membershipNumber: true } },
        allocations: {
          include: {
            paymentTransaction: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                paidAt: true,
                receiptNumber: true,
              },
            },
          },
        },
      },
    });
    if (!contribution) throw new NotFoundError('Contribution not found');

    // --- Log: success ---
    logger.info(
      { traceId, contributionId: req.params.contributionId },
      'GET /api/payments/contributions/[contributionId] - Success',
    );

    // --- Response ---
    return success(res, { data: contribution });
  }),
];
