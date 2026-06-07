// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------
import { ForbiddenError, UnauthorizedError } from '@errors';
import { getUserContributionSummary } from '@feature/contributions/services/contribution.service';
// ---------------------------------------------------------------------------
// Validators / Types
// ---------------------------------------------------------------------------
import { LedgerQueryParams, LedgerRouteParams } from '@feature/ledger/validators';
// ---------------------------------------------------------------------------
// External feature services
// ---------------------------------------------------------------------------
import { getUserPaymentHistory } from '@feature/payments/services/payment.service';
import { prisma } from '@lib/prisma';
// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------
import { validate } from '@lib/validate';
// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import type { NextFunction, Request, Response } from 'express';

// ---------------------------------------------------------------------------
// GET /api/members/:memberId/ledger  —  Payment ledger + contribution summary
// Security: requires FINANCE role
// Business intent: give finance officers a single view of a member's payment
//   transactions alongside their contribution totals for reconciliation.
// ---------------------------------------------------------------------------
export const getMemberLedger: RequestHandler[] = [
  validate({ params: LedgerRouteParams, query: LedgerQueryParams }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ── Auth ────────────────────────────────────────────────────────────────
    const userId = req.user?.id as string;
    if (!userId) throw new UnauthorizedError('Unauthorized');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { association: true },
    });
    if (!user || !user.associationId) throw new ForbiddenError('User association not found');

    const association = {
      id: user.association.id,
      slug: user.association.slug,
      name: user.association.name,
    };

    // ── Auth log ────────────────────────────────────────────────────────────
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/members/[memberId]/ledger - Request started',
    );

    await withRole(req, UserRole.FINANCE);

    logger.info(
      { traceId, userId: user.id },
      'GET /api/members/[memberId]/ledger - User authorized',
    );

    // ── Business logic — fetch payments & summary concurrently ──────────────
    const query = req.query as { page?: number };
    const page = query?.page ?? 1;

    const [history, summary] = await Promise.all([
      getUserPaymentHistory(userId, page),
      getUserContributionSummary(userId),
    ]);

    // ── Result log & response ───────────────────────────────────────────────
    logger.info(
      { traceId, count: history.transactions.length },
      'GET /api/members/[memberId]/ledger - Success',
    );

    return success(res, {
      data: { transactions: history.transactions, summary },
      meta: history.pagination,
    });
  }),
];
