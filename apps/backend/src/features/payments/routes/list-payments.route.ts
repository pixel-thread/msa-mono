// ---------------------------------------------------------------------------
// ENDPOINT:  GET /api/payments
// SECURITY:  Requires FINANCE role
// PURPOSE:   List all payment transactions for the association with advanced
//            filtering (status, method, gateway, date range, search).
// ---------------------------------------------------------------------------

import { ForbiddenError,UnauthorizedError } from '@errors';
import { getAllTransactions } from '@feature/payments/services/payment.service';
import { GetTransactionsQuerySchema } from '@feature/payments/validators';
import { prisma } from '@lib/prisma';
import { validate } from '@lib/validate';
import { UserRole } from '@prisma/client';
import { logger } from '@src/shared/logger';
import { asyncHandler } from '@utils/async-handler';
import { success } from '@utils/responses';
import { withRole } from '@utils/with-role';
import type { RequestHandler } from 'express';
import { NextFunction, Request, Response } from 'express';

// ---- Helpers ----

/**
 * Resolve the authenticated user's association for multi-tenant scoping.
 */
async function getAssociation(req: Request) {
  const userId = req.user?.id as string;
  if (!userId) throw new UnauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { association: true },
  });

  if (!user || !user.associationId) throw new ForbiddenError('User association not found');

  return { id: user.association.id, slug: user.association.slug, name: user.association.name };
}

// ---- Handler ----

export const listPayments: RequestHandler[] = [
  // Step 1: Validate query params
  validate({ query: GetTransactionsQuerySchema }),

  // Step 2: Execute
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // --- Log: request started ---
    logger.info({ traceId, query: req.query }, 'GET /api/payments - Request started');

    // --- Auth: resolve association ---
    const association = await getAssociation(req);

    // --- Auth: enforce FINANCE role ---
    // Only finance officers should view all transactions
    await withRole(req, UserRole.FINANCE);
    logger.info({ traceId }, 'GET /api/payments - User authorized');

    // --- Business logic: fetch filtered transactions ---
    const result = await getAllTransactions(association.id, (req.query as any) || {});

    // --- Log: success ---
    logger.info({ traceId, count: result.transactions.length }, 'GET /api/payments - Success');

    // --- Response ---
    return success(res, { data: result.transactions, meta: result.pagination });
  }),
];
