import { incomeStatement, trialBalance } from '@feature/ledger/services/reports.service';
import { ReportQuerySchema } from '@feature/ledger/validators';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

export const getTrialBalanceHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/ledger/reports/trial-balance - Request started',
    );

    await withRole(req, UserRole.FINANCE);

    const report = await trialBalance(association.id);

    return success(res, { data: report }, 200);
  }),
];

export const getIncomeStatementHandler: RequestHandler[] = [
  validate({ query: ReportQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/ledger/reports/income-statement - Request started',
    );

    await withRole(req, UserRole.FINANCE);

    const { fromDate, toDate } = req.query as any;

    const from = fromDate ? new Date(fromDate as string) : undefined;
    const to = toDate ? new Date(toDate as string) : undefined;

    const report = await incomeStatement(association.id, from, to);

    return success(res, { data: report }, 200);
  }),
];
