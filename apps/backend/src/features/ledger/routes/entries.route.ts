// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import {
  approveEntry,
  createManualEntry,
  getEntries,
  rejectEntry,
} from '@feature/ledger/services/ledger.service';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import { CreateLedgerEntrySchema, LedgerQueryParams } from '@feature/ledger/validators';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { buildPagination } from '@utils';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /api/ledger/entries  –  List ledger entries
// Security: FINANCE role required
// ---------------------------------------------------------------------------

export const listEntries: RequestHandler[] = [
  validate({ query: LedgerQueryParams }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/ledger/entries - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------

    const page = (req.query as any).page || 1;
    const { entries, total } = await getEntries(req.user!.associationId, page);

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, count: entries.length }, 'GET /api/ledger/entries - Success');
    return success(res, { data: entries, meta: buildPagination(total, page) });
  }),
];

// ---------------------------------------------------------------------------
// POST /api/ledger/entries  –  Create a manual ledger entry
// Security: FINANCE role required
// ---------------------------------------------------------------------------

export const createEntry: RequestHandler[] = [
  validate({ body: CreateLedgerEntrySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/ledger/entries - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    const userId = req.user?.id as string;
    await withRole(req, UserRole.FINANCE);
    logger.info({ traceId, userId }, 'POST /api/ledger/entries - User authorized');

    // ---- Business logic ----------------------------------------------------

    const entry = await createManualEntry(req.user!.associationId, userId, {
      description: req.body.description,
      paymentId: req.body.paymentId,
      lines: req.body.lines,
    });

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, entryId: entry.id }, 'POST /api/ledger/entries - Success');
    return success(res, { data: entry }, 201);
  }),
];

// ---------------------------------------------------------------------------
// POST /api/ledger/entries/:entryId/approve  –  Approve a ledger entry
// Security: PRESIDENT role required (higher authority than FINANCE)
// ---------------------------------------------------------------------------

export const approveEntryHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/ledger/entries/[entryId]/approve - Request started',
    );

    // ---- Authorize (PRESIDENT role) ----------------------------------------

    await withRole(req, UserRole.PRESIDENT);
    const userId = req.user?.id as string;

    // ---- Business logic ----------------------------------------------------

    const { entryId } = req.params;
    const entry = await approveEntry(entryId as string, userId);

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, entryId }, 'POST /api/ledger/entries/[entryId]/approve - Success');
    return success(res, { data: entry });
  }),
];

// ---------------------------------------------------------------------------
// POST /api/ledger/entries/:entryId/reject  –  Reject a ledger entry
// Security: PRESIDENT role required
// ---------------------------------------------------------------------------

export const rejectEntryHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/ledger/entries/[entryId]/reject - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    const { entryId } = req.params;
    const entry = await rejectEntry(entryId as string);

    logger.info({ traceId, entryId }, 'POST /api/ledger/entries/[entryId]/reject - Success');
    return success(res, { data: entry });
  }),
];
