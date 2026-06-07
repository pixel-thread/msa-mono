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
import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

import { incomeStatement, trialBalance } from '../services/reports.service';

// ---------------------------------------------------------------------------
// Local schemas
// ---------------------------------------------------------------------------

/** Schema for creating a new account. */
const CreateAccountSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  description: z.string().optional(),
});

/** Schema for paginated account query. */
const AccountQuerySchema = z.object({
  page: pageNumberValidation,
});

// ---------------------------------------------------------------------------
// GET /api/ledger/accounts  –  List ledger accounts
// Security: FINANCE role required
// ---------------------------------------------------------------------------

export const listAccounts: RequestHandler[] = [
  validate({ query: AccountQuerySchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'GET /api/ledger/accounts - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------

    const page = (req.query as any).page || 1;
    const { accounts, total } = await getAccounts(association.id, page);

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
  validate({ body: CreateAccountSchema }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';

    // ---- Resolve association & log request ---------------------------------

    const association = await getAssociation(req);
    logger.info(
      { traceId, associationId: association.id },
      'POST /api/ledger/accounts - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------

    const account = await createAccount(association.id, req.body);

    // ---- Result ------------------------------------------------------------

    logger.info({ traceId, accountId: account.id }, 'POST /api/ledger/accounts - Success');
    return success(res, { data: account }, 201);
  }),
];

// ---------------------------------------------------------------------------
// DELETE /api/ledger/accounts/:id  –   Delete a ledger account
// Security: FINANCE role required
// ---------------------------------------------------------------------------
const DeleteAccountRouteParam = z.object({
  id: z.uuid('Invalid Ledger Account ID'),
});

export const deleteAccountHandler: RequestHandler[] = [
  validate({ params: DeleteAccountRouteParam }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const accountId = req.params.id;

    // ---- Resolve association & log request ---------------------------------
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'DELETE /api/ledger/accounts/:id - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    const user = await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------
    // check if account exist
    const existingAccount = await getAccount(association.id, accountId as string);

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
    const account = await deleteAccount(association.id, existingAccount.id);
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
const UpdateAccountRouteParam = z.object({
  id: z.uuid('Invalid Ledger Account ID'),
});

export const updateAccountHandler: RequestHandler[] = [
  validate({ params: UpdateAccountRouteParam, body: CreateAccountSchema.partial().strict() }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const accountId = req.params.id;
    const data = req.body;

    // ---- Resolve association & log request ---------------------------------
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'PUT /api/ledger/accounts/:id - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    const user = await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------
    // check if account exist
    const existingAccount = await getAccount(association.id, accountId as string);

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
    const account = await updateAccount(association.id, existingAccount.id, data);
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
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'POST /api/ledger/accounts/seed - Request started',
    );

    await withRole(req, UserRole.PRESIDENT);

    await seedChartOfAccounts(association.id);

    logger.info({ traceId }, 'POST /api/ledger/accounts/seed - Success');
    return success(res, { data: null, message: 'Chart of accounts seeded successfully' }, 201);
  }),
];

// ---------------------------------------------------------------------------
// GET /api/ledger/accounts/:id  –   Get a ledger account
// Security: FINANCE role required
// ---------------------------------------------------------------------------
const GetAccountRouteParam = z.object({
  id: z.uuid('Invalid Ledger Account ID'),
});

export const getAccountHandler: RequestHandler[] = [
  validate({ params: GetAccountRouteParam }),
  asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const traceId = (req.traceId as string) || '';
    const accountId = req.params.id;

    // ---- Resolve association & log request ---------------------------------
    const association = await getAssociation(req);

    logger.info(
      { traceId, associationId: association.id },
      'GET /api/ledger/accounts/:id - Request started',
    );

    // ---- Authorize (FINANCE role) ------------------------------------------

    const user = await withRole(req, UserRole.FINANCE);

    // ---- Business logic ----------------------------------------------------
    // check if account exist
    const existingAccount = await getAccount(association.id, accountId as string);

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
    const trailBalance = await trialBalance(association.id, accountId as string);
    const incomeStatementReport = await incomeStatement(
      association.id,
      undefined,
      undefined,
      accountId as string,
    );

    const dataWithReport = {
      ...existingAccount,
      report: {
        trailBalance,
        incomeStatement: incomeStatementReport,
      },
    };
    return success(res, { data: dataWithReport, message: 'Ledger Account Updated' });
  }),
];
