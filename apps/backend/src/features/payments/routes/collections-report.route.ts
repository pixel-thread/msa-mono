// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments/reports/collections
// SECURITY:  Requires FINANCE role
// PURPOSE:   Fetch paginated contribution-period data for finance reports,
//            optionally filtered by year, month, and status.
// ---------------------------------------------------------------------------

import { Request, NextFunction, Response } from 'express';
import type { RequestHandler } from 'express';

import { validate } from '@src/shared/lib/validate';
import { success } from '@utils/responses';
import { buildPagination } from '@utils/build-pagination';
import { logger } from '@src/shared/logger';
import { UserRole } from '@prisma/client';
import { withRole } from '@utils/with-role';
import { CollectionReportQuerySchema } from '@src/features/payments/validators';
import { findContributionPeriods } from '@src/features/contributions/services/find-contribution-periods';
import { PAGE_SIZE } from '@src/shared/constants';
import { asyncHandler } from '@utils/async-handler';
import { getAssociation } from '@services/association/get-association';

export const collectionsReport: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: CollectionReportQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    const query = req.query as any;
    logger.info(
      { traceId, year: query.year, month: query.month },
      'GET /api/payments/reports/collections - Request started',
    );

    // --- Auth: resolve association ---
    const association = await getAssociation(req);

    // --- Auth: enforce FINANCE role ---
    await withRole(req, UserRole.FINANCE);
    logger.info({ traceId }, 'GET /api/payments/reports/collections - User authorized');

    // --- Business logic: fetch contribution periods with filters ---
    const { contributions: collections, total } = await findContributionPeriods({
      where: {
        associationId: association.id,
        year: query.year,
        month: query.month,
        status: query.status,
      },
      page: query.page,
      pageSize: PAGE_SIZE,
      include: {
        user: { select: { name: true, membershipNumber: true } },
        allocations: { include: { paymentTransaction: true } },
      },
    });

    // --- Log: success ---
    logger.info(
      { traceId, count: collections.length, total },
      'GET /api/payments/reports/collections - Success',
    );

    // --- Response ---
    return success(res, { data: collections, meta: buildPagination(total, query.page) });
  }),
];
