// ---- Routes: Admin consent
// ---- Description: Admin endpoints for viewing all consent records, history, and reports.
// ---- Security: DPO role required (except getConsentHistory which is for the current user)

// External libs
import { ForbiddenError, UnauthorizedError } from '@errors';
// Services
import { ConsentService } from '@feature/consent/services/consent.service';
// Validators
import type { AllConsentRecordsQueryInput } from '@feature/consent/validators/consent.validators';
import {
  AllConsentRecordsQuerySchema,
  HistoryQuerySchema,
} from '@feature/consent/validators/consent.validators';
// Prisma
import { prisma } from '@lib/prisma';
// Shared utilities
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { getUniqueUser } from '@services/user/get-unique-user';
import { logger } from '@src/shared/logger';
import { buildPagination } from '@utils';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---- Helper: Role hierarchy for permission checks
// Lower number = higher privilege. SUPER_ADMIN (0) is the highest.

const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 0,
  PRESIDENT: 1,
  SECRETARY: 2,
  FINANCE: 3,
  DPO: 4,
  MEMBER: 5,
};

// ---- Helper: withRole
// Ensures the authenticated user meets the minimum role requirement.

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

// ---- GET /api/consent/all
// ---- Description: Retrieve all consent records for the association.
// ---- Security: DPO role required

export const getAllConsentRecords: RequestHandler[] = [
  validate({ query: AllConsentRecordsQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // ---- Extract tracing context

    const traceId = (req.traceId as string) || '';

    // ---- Auth: verify association membership

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/consent/all - Request started',
    );

    // ---- Auth: verify user has at least DPO role

    await withRole(req, UserRole.DPO);

    // ---- Parse query parameters

    const page = (req.query as any).page ?? 1;

    // ---- Fetch consent records
    // Wire up actual typed service call

    const { records, total } = await ConsentService.getAllConsentRecords(
      req.user!.associationId,
      req.query as AllConsentRecordsQueryInput,
    );

    // ---- Log success and return response

    logger.info({ traceId, count: records.length }, 'GET /api/consent/all - Success');
    return success(res, { data: records, meta: buildPagination(total, page) });
  }),
];

// ---- GET /api/consent/history
// ---- Description: Retrieve the current user's consent history.
// ---- Security: Authenticated user (any role)

export const getConsentHistory: RequestHandler[] = [
  validate({ query: HistoryQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // ---- Extract tracing context

    const traceId = (req.traceId as string) || '';

    // ---- Auth: verify association membership

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/consent/history - Request started',
    );

    // ---- Resolve the requesting user ID

    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError();

    // ---- Parse query parameters

    const page = (req.query as any).page || 1;

    // ---- Fetch consent history

    const data = await ConsentService.getConsentHistory(userId, req.user!.associationId, page);

    // ---- Log success and return response

    logger.info({ traceId, userId }, 'GET /api/consent/history - Success');
    return success(res, { data: data.history, meta: data.pagination });
  }),
];

// ---- GET /api/consent/report
// ---- Description: Generate a consent summary report across the association.
// ---- Security: DPO role required

export const getConsentReport: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    // ---- Extract tracing context

    const traceId = (req.traceId as string) || '';

    // ---- Auth: verify association membership

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/consent/report - Request started',
    );

    // ---- Auth: verify user has at least DPO role

    await withRole(req, UserRole.DPO);

    // ---- Fetch consent report

    const report = await ConsentService.getConsentReport(req.user!.associationId);

    // ---- Log success and return response

    logger.info({ traceId }, 'GET /api/consent/report - Success');
    return success(res, { data: report });
  }),
];
