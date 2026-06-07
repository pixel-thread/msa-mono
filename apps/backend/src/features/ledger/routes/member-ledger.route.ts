// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { getMemberEntries } from '@feature/ledger/services/ledger.service';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { getAssociation } from '@services/association/get-association';
import { logger } from '@src/shared/logger';
import { buildPagination } from '@utils';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import { pageNumberValidation } from '@validator';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Local schemas
// ---------------------------------------------------------------------------

/** Schema for paginated member ledger query. */
const QuerySchema = z.object({
  page: pageNumberValidation,
});

// ---------------------------------------------------------------------------
// GET /api/ledger/member/:memberId  –  Retrieve ledger entries for a member
// Security: FINANCE role required
// ---------------------------------------------------------------------------

export const getMemberLedger: RequestHandler[] = [
  validate({ query: QuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/ledger/member/[memberId] - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------

    const { memberId } = req.params;
    const page = (req.query as any).page || 1;
    const { entries, total } = await getMemberEntries(association.id, memberId as string, page);

    // ---- Result ------------------------------------------------------------

    logger.info(
      { traceId, memberId, count: entries.length },
      'GET /api/ledger/member/[memberId] - Success',
    );
    return success(res, { data: entries, meta: buildPagination(total, page) });
  }),
];
