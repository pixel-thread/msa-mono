// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------

import { NotFoundError } from '@errors';
// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
import {
  createAccount,
  deleteAccount,
  getAccount,
  getAccounts,
  updateAccount,
} from '@feature/ledger/services/ledger.service';
import { seedChartOfAccounts } from '@feature/ledger/services/seed-chart-of-accounts';
import {
  CreateLedgerAccountSchema,
  LedgerAccountParamsSchema,
  LedgerAccountQuerySchema,
} from '@feature/ledger/validators';
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

import { accountBalance } from '../services/reports.service';

// ---------------------------------------------------------------------------
// GET /api/ledger/accounts  –  List ledger accounts
// Security: FINANCE role required
// ---------------------------------------------------------------------------

export const listAccounts: RequestHandler[] = [
  validate({ query: LedgerAccountQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/ledger/accounts - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------

    const page = parseInt(req.query.page as string) || 1;
    const { accounts, total } = await getAccounts(req.user!.associationId, page);

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, count: accounts.length }, 'GET /api/ledger/accounts - Success');
    return success(res, { data: accounts, meta: buildPagination(total, page) });
  }),
];

// ---------------------------------------------------------------------------
// POST /api/ledger/accounts  –  Create a new ledger account
// Security: FINANCE role required
// ---------------------------------------------------------------------------

export const createAccountHandler: RequestHandler[] = [
  validate({ body: CreateLedgerAccountSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/ledger/accounts - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------

    const account = await createAccount(req.user!.associationId, req.body);

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, accountId: account.id }, 'POST /api/ledger/accounts - Success');
    return success(res, { data: account }, 201);
  }),
];

// ---------------------------------------------------------------------------
// DELETE /api/ledger/accounts/:id  –   Delete a ledger account
// Security: FINANCE role required
// ---------------------------------------------------------------------------
export const deleteAccountHandler: RequestHandler[] = [
  validate({ params: LedgerAccountParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const accountId = req.params.id;

    // ---- Resolve association & log request ---------------------------------

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'DELETE /api/ledger/accounts/:id - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    const user = await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------
    // check if account exist
    const existingAccount = await getAccount(req.user!.associationId, accountId as string);

    if (!existingAccount) {
      logger.info(
        { traceId, accountId, userId: user.id },
        'DELETE /api/ledger/accounts/:id - Account not found',
      );
      throw new NotFoundError('Account not found');
    }

    logger.info(
      { traceId, accountId, userId: user.id },
      'DELETE /api/ledger/accounts/:id - Ledger Account found',
    );

    logger.info(
      { traceId, accountId },
      'DELETE /api/ledger/accounts/:id - Ledger Account Deleting',
    );
    const account = await deleteAccount(req.user!.associationId, existingAccount.id);
    logger.info({ traceId, accountId }, 'DELETE /api/ledger/accounts/:id - Ledger Account Deleted');

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, accountId: account.id }, 'DELETE /api/ledger/accounts/:id - Success');
    return success(res, { data: account, message: 'Ledger Account Deleted' });
  }),
];

// ---------------------------------------------------------------------------
// PUT /api/ledger/accounts/:id  –   Delete a ledger account
// Security: FINANCE role required
// ---------------------------------------------------------------------------
export const updateAccountHandler: RequestHandler[] = [
  validate({
    params: LedgerAccountParamsSchema,
    body: CreateLedgerAccountSchema.partial().strict(),
  }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const accountId = req.params.id;
    const data = req.body;

    // ---- Resolve association & log request ---------------------------------

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'PUT /api/ledger/accounts/:id - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    const user = await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------
    // check if account exist
    const existingAccount = await getAccount(req.user!.associationId, accountId as string);

    if (!existingAccount) {
      logger.info(
        { traceId, accountId, userId: user.id },
        'PUT /api/ledger/accounts/:id - Account not found',
      );
      throw new NotFoundError('Account not found');
    }

    logger.info(
      { traceId, accountId, userId: user.id },
      'PUT /api/ledger/accounts/:id - Account found',
    );
    logger.info({ traceId, accountId }, 'PUT /api/ledger/accounts/:id - Ledger Account Updating');
    const account = await updateAccount(req.user!.associationId, existingAccount.id, data);
    logger.info({ traceId, accountId }, 'PUT /api/ledger/accounts/:id - Ledger Account Updated');

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, accountId: account.id }, 'PUT /api/ledger/accounts/:id - Success');
    return success(res, { data: account, message: 'Ledger Account Updated' });
  }),
];

// ---------------------------------------------------------------------------
// POST /api/ledger/accounts/seed  –   Seed chart of accounts
// Security: PRESIDENT role required
// ---------------------------------------------------------------------------

export const seedAccountsHandler: RequestHandler[] = [
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'POST /api/ledger/accounts/seed - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    await seedChartOfAccounts(req.user!.associationId);

    logger.info({ traceId }, 'POST /api/ledger/accounts/seed - Success');
    return success(res, { data: null, message: 'Chart of accounts seeded successfully' }, 201);
  }),
];

// ---------------------------------------------------------------------------
// GET /api/ledger/accounts/:id  –   Get a ledger account
// Security: FINANCE role required
// ---------------------------------------------------------------------------
export const getAccountHandler: RequestHandler[] = [
  validate({ params: LedgerAccountParamsSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const accountId = req.params.id;

    // ---- Resolve association & log request ---------------------------------

    logger.info(
      { traceId, associationId: req.user!.associationId },
      'GET /api/ledger/accounts/:id - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    const user = await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------
    // check if account exist
    const existingAccount = await getAccount(req.user!.associationId, accountId as string);

    if (!existingAccount) {
      logger.info(
        { traceId, accountId, userId: user.id },
        'GET /api/ledger/accounts/:id - Account not found',
      );
      throw new NotFoundError('Account not found');
    }

    logger.info(
      { traceId, accountId, userId: user.id },
      'GET /api/ledger/accounts/:id - Account found',
    );

    // ---- Result ------------------------------------------------------------

    logger.info(
      { traceId, accountId: existingAccount.id },
      'GET /api/ledger/accounts/:id - Success',
    );
    const balance = await accountBalance(req.user!.associationId, accountId as string);

    return success(res, { data: { ...existingAccount, balance } });
  }),
];
