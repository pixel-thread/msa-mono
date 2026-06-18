// ---------------------------------------------------------------------------
// ENDPOINT:  CRUD /api/v1/contributions/contributions
// SECURITY:  Requires FINANCE role (except where noted)
// PURPOSE:   Manage contribution periods — list, generate monthly records,
//            waive individual periods, and view a single period by ID.
// ---------------------------------------------------------------------------

import { NotFoundError, UnauthorizedError } from '@errors';
import {
  generateUserContributions,
  markOverdueContributions,
  waiveContribution,
} from '@feature/contributions/services/contribution.service';
import { findContributionPeriods } from '@feature/contributions/services/find-contribution-periods';
import { findUniqueContributionPeriod } from '@feature/contributions/services/find-unique-contribution-period';
import type { ContributionsQueryInput } from '@feature/contributions/validators';
import {
  ContributionIdParamsSchema,
  ContributionsQuerySchema,
  GenerateContributionsSchema,
  GenerateUserContributionsSchema,
  UserContributionsParamsSchema,
  WaiveContributionSchema,
} from '@feature/contributions/validators';
import { validate } from '@lib/validate';
import { AuditAction, ContributionStatus, UserRole } from '@prisma/client';
import { logAction } from '@services/audit-logs';
import { PAGE_SIZE } from '@src/shared/constants';
import { logger } from '@src/shared/logger';
import { findUnpaginatedUsers } from '@src/shared/services/user/getUsers';
import { buildPagination } from '@src/shared/utils/helper/build-pagination';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { NextFunction, RequestHandler, Response } from 'express';
import { type Request } from 'express';

// ---- Helpers ----

// ===========================================================================
// LIST /api/payments/contributions
// ===========================================================================

export const myContributionsHandler: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: ContributionsQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedError('User not found');

    // --- Log: request started ---
    logger.info({ traceId, query: req.query }, 'GET /api/payments/contributions - Request started');

    // --- Auth: enforce FINANCE role ---
    // Only finance officers can view the full contributions list
    await withRole(req, UserRole.MEMBER);

    logger.info({ traceId }, 'GET /api/payments/contributions - User authorized');

    const query = req.query as any as ContributionsQueryInput;
    // --- Business logic: build filters and fetch ---
    const page = query?.page || 1;

    const { status, year } = req.query;

    const where: Record<string, unknown> = { associationId: req.user!.associationId };
    where.userId = userId;
    if (status !== 'ALL') where.status = status;
    if (year) where.year = year;

    const { contributions, total } = await findContributionPeriods({
      where: where as Parameters<typeof findContributionPeriods>[0]['where'],
      page,
      pageSize: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true, membershipNumber: true } },
        waiver: true,
        allocations: {
          take: 1,
          where: { paymentTransaction: { paidAt: { not: null } } },
          include: {
            paymentTransaction: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                paidAt: true,
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
    return success(res, {
      data: contributions,
      meta: buildPagination(total, page),
    });
  }),
];

export const myContributionsOverviewHandler: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: ContributionsQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const userId = req.user?.id;

    if (!userId) throw new UnauthorizedError('User not found');

    // --- Log: request started ---
    logger.info({ traceId, query: req.query }, 'GET /api/payments/contributions - Request started');

    // --- Auth: enforce FINANCE role ---
    // Only finance officers can view the full contributions list
    await withRole(req, UserRole.MEMBER);

    logger.info({ traceId }, 'GET /api/payments/contributions - User authorized');

    const query = req.query as any as ContributionsQueryInput;
    // --- Business logic: build filters and fetch ---
    const page = query?.page || 1;

    const { status, year } = req.query;

    const where: Record<string, unknown> = { associationId: req.user!.associationId };
    where.userId = userId;
    if (status !== 'ALL') where.status = status;
    if (year) where.year = year;

    const { contributions: unfiltered } = await findContributionPeriods({
      where: where as Parameters<typeof findContributionPeriods>[0]['where'],
      page: 0,
      pageSize: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, email: true, membershipNumber: true } },
        waiver: true,
      },
    });

    const overview = unfiltered.reduce(
      (acc, c) => {
        const expected = Number(c.expectedAmount);
        const paid = Number(c.paidAmount);
        const due = Number(c.dueAmount);

        acc.totalExpected += expected;
        acc.totalPaid += paid;

        if (c.status === ContributionStatus.PARTIAL) acc.totalPartial += paid;
        if (c.status === ContributionStatus.OVERDUE) {
          acc.overdueCount += 1;
          acc.overdueAmount += due;
        }
        if (c.status === ContributionStatus.DUE || c.status === ContributionStatus.PENDING)
          acc.pendingCount += 1;
        if ('waiver' in c && c.waiver) acc.waivedTotal += expected;

        return acc;
      },
      {
        totalExpected: 0,
        totalPartial: 0,
        totalPaid: 0,
        overdueAmount: 0,
        overdueCount: 0,
        pendingCount: 0,
        waivedTotal: 0,
      },
    );

    // --- Log: success ---
    logger.info({ traceId, overview }, 'GET /api/payments/contributions - Success');

    // --- Response ---
    return success(res, { data: overview });
  }),
];

export const listContributionsHandler: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: ContributionsQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId, query: req.query }, 'GET /api/payments/contributions - Request started');

    // --- Auth: enforce FINANCE role ---
    // Only finance officers can view the full contributions list
    await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'GET /api/payments/contributions - User authorized');

    // --- Business logic: build filters and fetch ---
    const page = (req.query as any)?.page || 1;

    const { status, userId: filterUserId, year, month } = req.query;

    const where: Record<string, unknown> = { associationId: req.user!.associationId };
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
        waiver: true,
        allocations: {
          take: 1,
          where: { paymentTransaction: { paidAt: { not: null } } },
          include: {
            paymentTransaction: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                paidAt: true,
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

    // --- Auth: enforce FINANCE role ---
    await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'POST /api/payments/contributions - User authorized');

    // --- Business logic: generate monthly contributions ---
    logger.info(
      { traceId, year: req.body.year, months: req.body.months },
      'POST /api/payments/contributions - Generating contributions',
    );

    const count = await generateUserContributions(userId, req.body.year, 12);

    const overdueCount = await markOverdueContributions(req.user!.associationId, userId);

    await logAction({
      associationId: req.user!.associationId,
      actorId: req.user!.id,
      action: AuditAction.CREATE,
      resourceType: 'ContributionPeriod',
      resourceId: userId,
      newValues: {
        year: req.body.year,
        months: req.body.months,
        generatedCount: count,
        markedOverdue: overdueCount,
      },
      traceId,
    });

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

export const generateContributionsHandler: RequestHandler[] = [
  // Step 1: Validate request body
  validate({ body: GenerateContributionsSchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const associationId = req.user?.associationId as string;

    // --- Log: request started ---
    logger.info(
      { traceId, year: req.body.year, month: req.body.month, associationId },
      'POST /api/payments/contributions - Request started',
    );

    // --- Auth: enforce FINANCE role ---
    await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'POST /api/payments/contributions - User authorized');

    // --- Business logic: generate monthly contributions ---
    logger.info(
      { traceId, year: req.body.year, months: req.body.months },
      'POST /api/payments/contributions - Generating contributions',
    );

    const users = await findUnpaginatedUsers({ where: { associationId, status: 'ACTIVE' } });

    let count;

    for (const user of users) {
      count = await generateUserContributions(user.id, req.body.year, 12);
    }

    const overdueCount = await markOverdueContributions(associationId);

    await logAction({
      associationId: req.user!.associationId,
      actorId: req.user!.id,
      action: AuditAction.CREATE,
      resourceType: 'ContributionPeriod',
      newValues: {
        year: req.body.year,
        months: req.body.months,
        generatedCount: count ?? 0,
        markedOverdue: overdueCount,
      },
      traceId,
    });

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

    // --- Auth: enforce FINANCE role ---
    // Waiving contributions is a financial decision — restricted to finance
    const user = await withRole(req, UserRole.FINANCE);

    logger.info({ traceId }, 'PATCH /api/payments/contributions - User authorized');

    // --- Business logic: waive the contribution period ---
    const waived = await waiveContribution(req.body.contributionPeriodId, req.body.reason, user.id);

    await logAction({
      associationId: req.user!.associationId,
      actorId: user.id,
      action: AuditAction.PAYMENT_WAIVED,
      resourceType: 'ContributionPeriod',
      resourceId: req.body.contributionPeriodId,
      newValues: { reason: req.body.reason },
      traceId,
    });

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

export const getContributionHandler: RequestHandler[] = [
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

    // --- Business logic: fetch single contribution period ---
    const contribution = await findUniqueContributionPeriod({
      where: { id: req.params.contributionId as string, associationId: req.user!.associationId },
      include: {
        user: { select: { id: true, name: true, email: true, membershipNumber: true } },
        waiver: true,
        allocations: {
          include: {
            paymentTransaction: {
              select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                paidAt: true,
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
