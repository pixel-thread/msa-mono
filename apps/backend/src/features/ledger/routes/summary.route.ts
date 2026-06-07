// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { getSummary } from '@feature/ledger/services/ledger.service';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { NextFunction, Request, RequestHandler, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /api/ledger/summary  –  Retrieve ledger summary
// Security: FINANCE role required
// ---------------------------------------------------------------------------

export const getLedgerSummary: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association -------------------------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/ledger/summary - Request started',
    );

    // ---- Authorize (FINANCE role) --------------------------------------------

    await withRole(req, UserRole.FINANCE);

    // ---- Business logic ------------------------------------------------------

    const data = await getSummary(association.id);

    // ---- Result --------------------------------------------------------------

    logger.info({ traceId, count: data.accounts.length }, 'GET /api/ledger/summary - Success');
    return success(res, { data });
  }),
];
