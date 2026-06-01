// ---------------------------------------------------------------------------
// External libs
// ---------------------------------------------------------------------------

import { Router } from 'express';

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

import { auth } from '@middleware/auth';

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

import {
  listAccounts,
  createAccountHandler,
  deleteAccountHandler,
  updateAccountHandler,
  seedAccountsHandler,
  getAccountHandler,
} from './accounts.route';
import { listEntries, createEntry, approveEntryHandler, rejectEntryHandler } from './entries.route';
import { getLedgerSummary } from './summary.route';
import { getMemberLedger } from './member-ledger.route';
import { getTrialBalanceHandler, getIncomeStatementHandler } from './reports.route';

// ---------------------------------------------------------------------------
// Router setup – all routes require authentication
// ---------------------------------------------------------------------------

const router: Router = Router();

router.use(auth);

// ---- Accounts ---------------------------------------------------------------

router.get('/accounts', listAccounts);
router.post('/accounts', createAccountHandler);
router.put('/accounts/:id', updateAccountHandler);
router.post('/accounts/seed', seedAccountsHandler);
router.delete('/accounts/:id', deleteAccountHandler);
router.get('/accounts/:id', getAccountHandler);

// ---- Entries ----------------------------------------------------------------

router.get('/entries', listEntries);
router.post('/entries', createEntry);
router.post('/entries/:entryId/approve', approveEntryHandler);
router.post('/entries/:entryId/reject', rejectEntryHandler);

// ---- Summary & Reports ------------------------------------------------------

router.get('/summary', getLedgerSummary);
router.get('/reports/trial-balance', getTrialBalanceHandler);
router.get('/reports/income-statement', getIncomeStatementHandler);

// ---- Member-specific ledger -------------------------------------------------

router.get('/member/:memberId', getMemberLedger);

export default router;
