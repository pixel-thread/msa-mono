// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import { generateComplianceEvidence } from '@feature/compliance/services';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /compliance/evidence  —  Generate compliance evidence report
// Security: requires DPO role
// Business intent: produce a structured snapshot of consent receipts, DSAR
//   tickets, member data, payment transactions, and audit logs for a given
//   lookback window so the DPO can present evidence to a regulator.
// ---------------------------------------------------------------------------
export const getEvidence: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /compliance/evidence - Request started',
    );

    const user = await withRole(req, UserRole.DPO);

    logger.info(
      { traceId, userId: user.id, roles: user.role },
      'GET /compliance/evidence - User authorized',
    );

    // ── Business logic — generate evidence report ───────────────────────────
    const days = parseInt(req.query.days as string, 10) || 30;
    const evidence = await generateComplianceEvidence(req.user!.associationId, days);

    // ── Result log & response ───────────────────────────────────────────────
    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /compliance/evidence - Success',
    );
    return success(res, { data: evidence });
  }),
];
