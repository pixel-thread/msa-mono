// ---------------------------------------------------------------------------
// Prisma
// ---------------------------------------------------------------------------

import { ApprovalStatus, Prisma } from '@prisma/client';
import { prisma } from '@lib/prisma';
import { buildPaginationParams } from '@utils/helper';

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

import { ValidationError, NotFoundError } from '@errors';
import { PAGE_SIZE } from '@src/shared/constants';
import { logger } from '@src/shared/logger';
import { ContextStore } from '@lib';

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/** Input for creating a manual ledger entry. */
export interface CreateManualEntryInput {
  description: string;
  paymentId?: string | null;
  lines: Array<{
    accountId: string;
    isDebit: boolean;
    amount: number;
  }>;
}

/** Input for creating a new account. */
export interface CreateAccountInput {
  code: string;
  name: string;
  type: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Ledger Entries
// ---------------------------------------------------------------------------

/**
 * Retrieve paginated ledger entries for an association.
 *
 * WHY: The finance dashboard shows a paginated list of entries with
 * related lines and the originating payment transaction.
 */
export async function getEntries(associationId: string, page = 1) {
  const { skip, take, page: currentPage } = buildPaginationParams(page);

  const where: Prisma.LedgerEntryWhereInput = {
    OR: [
      { paymentTransaction: { associationId } },
      { lines: { some: { account: { associationId } } } },
    ],
  };

  const [entries, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      include: {
        lines: true,
        paymentTransaction: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.ledgerEntry.count({ where }),
  ]);

  return { entries, total, page: currentPage };
}

/**
 * Create a manual ledger entry with validation.
 *
 * WHY: Finance officers may record offline transactions. The entry must
 * be balanced (debits === credits) and reference only active accounts
 * that belong to the current association.
 */
export async function createManualEntry(
  associationId: string,
  userId: string,
  input: CreateManualEntryInput,
) {
  // ---- Validate: at least one debit and one credit line ------------------

  const debits = input.lines.filter((l) => l.isDebit);
  const credits = input.lines.filter((l) => !l.isDebit);

  if (debits.length === 0 || credits.length === 0) {
    throw new ValidationError(
      'A ledger entry must have at least one debit line and one credit line.',
    );
  }

  // ---- Validate: debits must equal credits --------------------------------

  const totalDebits = debits.reduce((sum, l) => sum + l.amount, 0);
  const totalCredits = credits.reduce((sum, l) => sum + l.amount, 0);

  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    throw new ValidationError(
      `Ledger entry is not balanced. Total debits (${totalDebits.toFixed(2)}) must equal total credits (${totalCredits.toFixed(2)}).`,
    );
  }

  // ---- Validate: all referenced accounts exist and are active -------------

  const accountIds = input.lines.map((l) => l.accountId);
  const uniqueAccountIds = Array.from(new Set(accountIds));
  const accountsCount = await prisma.account.count({
    where: {
      id: { in: uniqueAccountIds },
      associationId,
      isActive: true,
    },
  });

  if (accountsCount !== uniqueAccountIds.length) {
    throw new ValidationError('One or more selected accounts are invalid or inactive.');
  }

  // ---- Persist the entry -------------------------------------------------

  return prisma.ledgerEntry.create({
    data: {
      description: input.description,
      createdById: userId,
      paymentTransactionId: input.paymentId || null,
      lines: {
        create: input.lines.map((line) => ({
          accountId: line.accountId,
          isDebit: line.isDebit,
          amount: line.amount,
          associationId,
        })),
      },
    },
    include: { lines: true },
  });
}

/**
 * Approve a ledger entry by ID.
 *
 * WHY: Entries created by FINANCE require PRESIDENT approval before they
 * are considered final. This two-person rule prevents unauthorised postings.
 */
export async function approveEntry(entryId: string, approvedById: string) {
  const existing = await prisma.ledgerEntry.findUnique({ where: { id: entryId } });

  if (!existing) {
    throw new NotFoundError(`Ledger entry ${entryId} not found.`);
  }
  if (existing.approvalStatus === ApprovalStatus.APPROVED) {
    throw new ValidationError('Cannot modify an approved ledger entry.');
  }

  return prisma.ledgerEntry.update({
    where: { id: entryId },
    data: {
      approvalStatus: ApprovalStatus.APPROVED,
      approvedById,
    },
  });
}

export async function rejectEntry(entryId: string) {
  const existing = await prisma.ledgerEntry.findUnique({ where: { id: entryId } });

  if (!existing) {
    throw new NotFoundError(`Ledger entry ${entryId} not found.`);
  }
  if (existing.approvalStatus !== ApprovalStatus.PENDING) {
    throw new ValidationError('Only pending ledger entries can be rejected.');
  }

  return prisma.ledgerEntry.update({
    where: { id: entryId },
    data: {
      approvalStatus: ApprovalStatus.REJECTED,
    },
  });
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

/**
 * Retrieve paginated active accounts for an association.
 *
 * WHY: The chart of accounts is shown in the accounts management UI;
 * inactive accounts are hidden from day-to-day selection.
 */
export async function getAccounts(associationId: string, page = 1) {
  const { skip, take, page: currentPage } = buildPaginationParams(page);

  const [accounts, total] = await Promise.all([
    prisma.account.findMany({
      where: { associationId, isActive: true },
      orderBy: { code: 'asc' },
      skip,
      take,
    }),
    prisma.account.count({
      where: { associationId, isActive: true },
    }),
  ]);

  return { accounts, total, page: currentPage };
}

/**
 * Create a new account for an association.
 *
 * WHY: Finance officers may extend the chart of accounts with custom
 * codes (e.g. expense categories specific to the association).
 */
export async function createAccount(associationId: string, input: CreateAccountInput) {
  return prisma.account.create({
    data: {
      code: input.code,
      name: input.name,
      type: input.type,
      description: input.description,
      associationId,
    },
  });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/**
 * Retrieve a snapshot of all accounts with a summary.
 *
 * WHY: The finance dashboard header shows an at-a-glance overview.
 * TODO: compute actual balance totals per account.
 */
export async function getSummary(associationId: string) {
  const accounts = await prisma.account.findMany({
    where: { associationId },
  });

  if (!accounts) throw new NotFoundError('Accounts not found');

  const totals = await prisma.ledgerLine.groupBy({
    by: ['accountId', 'isDebit'],
    where: {
      account: { associationId },
      ledgerEntry: { approvalStatus: 'APPROVED' },
    },
    _sum: { amount: true },
  });

  if (!totals) throw new NotFoundError('Ledger lines not found');

  let totalAssets = new Prisma.Decimal(0);
  let totalLiabilities = new Prisma.Decimal(0);
  let totalIncome = new Prisma.Decimal(0);
  let totalExpenses = new Prisma.Decimal(0);

  for (const account of accounts) {
    const accountTotals = totals.filter((t) => t.accountId === account.id);
    const debitTotal = accountTotals.find((t) => t.isDebit)?._sum.amount ?? new Prisma.Decimal(0);
    const creditTotal = accountTotals.find((t) => !t.isDebit)?._sum.amount ?? new Prisma.Decimal(0);

    let balance = new Prisma.Decimal(0);

    if (account.type === 'ASSET') {
      balance = debitTotal.sub(creditTotal);
      totalAssets = totalAssets.add(balance);
    } else if (account.type === 'EXPENSE') {
      balance = debitTotal.sub(creditTotal);
      totalExpenses = totalExpenses.add(balance);
    } else if (account.type === 'LIABILITY' || account.type === 'EQUITY') {
      balance = creditTotal.sub(debitTotal);
      totalLiabilities = totalLiabilities.add(balance);
    } else if (account.type === 'INCOME') {
      balance = creditTotal.sub(debitTotal);
      totalIncome = totalIncome.add(balance);
    }
  }

  const [pendingCount, approvedCount] = await Promise.all([
    prisma.ledgerEntry.count({
      where: {
        approvalStatus: 'PENDING',
        OR: [
          { paymentTransaction: { associationId } },
          { lines: { some: { account: { associationId } } } },
        ],
      },
    }),
    prisma.ledgerEntry.count({
      where: {
        approvalStatus: 'APPROVED',
        OR: [
          { paymentTransaction: { associationId } },
          { lines: { some: { account: { associationId } } } },
        ],
      },
    }),
  ]);

  return {
    accounts,
    summary: {
      totalAssets,
      totalLiabilities,
      totalIncome,
      totalExpenses,
      pendingEntries: pendingCount,
      approvedEntries: approvedCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Member-specific ledger entries
// ---------------------------------------------------------------------------

/**
 * Retrieve paginated ledger entries scoped to a single member.
 *
 * WHY: The member profile page shows a per-member transaction history.
 */
export async function getMemberEntries(associationId: string, memberId: string, page = 1) {
  const { skip, take, page: currentPage } = buildPaginationParams(page);

  const where = {
    createdById: memberId,
    OR: [
      { paymentTransaction: { associationId } },
      { lines: { some: { account: { associationId } } } },
    ],
  };

  const [entries, total] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      skip,
      take,
      include: { lines: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.ledgerEntry.count({ where }),
  ]);

  return { entries, total, page: currentPage };
}

export async function getAccount(associationId: string, accountId: string) {
  return await prisma.account.findUnique({
    where: { id: accountId, associationId, isActive: true },
  });
}

export async function deleteAccount(associationId: string, accountId: string) {
  const context = ContextStore.get();
  const userId = context?.userId;
  const traceId = context?.requestId;
  logger.info({ accountId, associationId, traceId, userId }, 'Deleting Leger Account started');
  return await prisma.account.update({
    where: { id: accountId, associationId, isActive: true },
    data: { isActive: false },
  });
}

export async function updateAccount(
  associationId: string,
  accountId: string,
  data: Partial<CreateAccountInput>,
) {
  const context = ContextStore.get();
  const userId = context?.userId;
  const traceId = context?.requestId;
  logger.info({ accountId, associationId, traceId, userId }, 'Updating Leger Account started');
  return await prisma.account.update({
    where: { id: accountId, associationId, isActive: true },
    data: data,
  });
}
