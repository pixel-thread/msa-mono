// ---- DSAR - SLA Report

// ---- Imports

// ---- External Libraries

// ---- DSAR Services
import { getDsarSlaStatus } from '@feature/dsar/services';
// ---- Prisma Types
import { UserRole } from '@prisma/client';
// ---- Shared Services
import { logger } from '@src/shared/logger';
import { withRole } from '@src/shared/utils/with-role';
import { asyncHandler } from '@utils/async-handler';
// ---- Shared Utilities
import { success } from '@utils/responses';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
// ---- Handlers

// ============================================================================
// GET /api/dsar/sla-report
// Description: Retrieve DSAR SLA compliance report
// Security: Requires DPO role
// ============================================================================

export const getSlaReport: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Auth: Resolve association

    // ---- Auth log

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/dsar/sla-report - Request started',
    );

    // ---- Auth: Verify role

    await withRole(req, UserRole.DPO);

    // ---- Business logic: Fetch SLA report

    const report = await getDsarSlaStatus(req.user!.associationId);

    // ---- Result log

    logger.info({ traceId }, 'GET /api/dsar/sla-report - Success');

    return success(res, { data: report, message: '' });
  }),
];
