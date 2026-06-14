import { NotFoundError } from '@errors';
import { prisma } from '@lib/prisma';
import { Prisma } from '@prisma/client';

export async function trialBalance(associationId: string, accountId?: string) {
  const accounts = await prisma.account.findMany({
    where: {
      associationId,
      ...(accountId ? { id: accountId } : {}),
    },
  });

  const totals = await prisma.ledgerLine.groupBy({
    by: ['accountId', 'isDebit'],
    where: {
      account: {
        associationId,
        ...(accountId ? { id: accountId } : {}),
      },
      ledgerEntry: { approvalStatus: 'APPROVED' },
    },
    _sum: { amount: true },
  });

  let totalDebits = new Prisma.Decimal(0);
  let totalCredits = new Prisma.Decimal(0);

  const balances = accounts.map((account) => {
    const accountTotals = totals.filter((t) => t.accountId === account.id);
    const debitTotal = accountTotals.find((t) => t.isDebit)?._sum.amount ?? new Prisma.Decimal(0);
    const creditTotal = accountTotals.find((t) => !t.isDebit)?._sum.amount ?? new Prisma.Decimal(0);

    totalDebits = totalDebits.add(debitTotal);
    totalCredits = totalCredits.add(creditTotal);

    // Asset and Expense have debit normal balances, others have credit
    const isDebitNormal = account.type === 'ASSET' || account.type === 'EXPENSE';
    const balance = isDebitNormal ? debitTotal.sub(creditTotal) : creditTotal.sub(debitTotal);

    return {
      accountId: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      debitTotal,
      creditTotal,
      balance,
    };
  });

  return {
    balances,
    totalDebits,
    totalCredits,
    isBalanced: totalDebits.equals(totalCredits),
  };
}

export async function incomeStatement(
  associationId: string,
  fromDate?: Date,
  toDate?: Date,
  accountId?: string,
) {
  const where: Prisma.LedgerLineWhereInput = {
    account: {
      associationId,
      type: { in: ['INCOME', 'EXPENSE'] },
      ...(accountId ? { id: accountId } : {}),
    },
    ledgerEntry: { approvalStatus: 'APPROVED' },
  };

  if (fromDate || toDate) {
    where.ledgerEntry = {
      ...((where.ledgerEntry as Prisma.LedgerEntryWhereInput) || {}),
      createdAt: {
        ...(fromDate ? { gte: fromDate } : {}),
        ...(toDate ? { lte: toDate } : {}),
      },
    };
  }

  const totals = await prisma.ledgerLine.groupBy({
    by: ['accountId', 'isDebit'],
    where,
    _sum: { amount: true },
  });

  const accounts = await prisma.account.findMany({
    where: {
      associationId,
      type: { in: ['INCOME', 'EXPENSE'] },
      ...(accountId ? { id: accountId } : {}),
    },
  });

  let totalIncome = new Prisma.Decimal(0);
  let totalExpense = new Prisma.Decimal(0);

  const statement = accounts.map((account) => {
    const accountTotals = totals.filter((t) => t.accountId === account.id);
    const debitTotal = accountTotals.find((t) => t.isDebit)?._sum.amount ?? new Prisma.Decimal(0);
    const creditTotal = accountTotals.find((t) => !t.isDebit)?._sum.amount ?? new Prisma.Decimal(0);

    // INCOME normal is CR, EXPENSE normal is DR
    let balance = new Prisma.Decimal(0);
    if (account.type === 'INCOME') {
      balance = creditTotal.sub(debitTotal);
      totalIncome = totalIncome.add(balance);
    } else {
      balance = debitTotal.sub(creditTotal);
      totalExpense = totalExpense.add(balance);
    }

    return {
      accountId: account.id,
      code: account.code,
      name: account.name,
      type: account.type,
      balance,
    };
  });

  return {
    details: statement,
    totalIncome,
    totalExpense,
    netIncome: totalIncome.sub(totalExpense),
  };
}
function isDebitNormal(type: string) {
  return type === 'ASSET' || type === 'EXPENSE';
}

function getSignedBalance(balance: Prisma.Decimal) {
  return Number(balance);
}

export async function accountBalance(associationId: string, accountId: string) {
  const account = await prisma.account.findUnique({
    where: {
      id: accountId,
      associationId,
    },
  });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  const totals = await prisma.ledgerLine.groupBy({
    by: ['isDebit'],
    where: {
      accountId,
      ledgerEntry: {
        approvalStatus: 'APPROVED',
      },
    },
    _sum: {
      amount: true,
    },
  });

  const debitTotal = totals.find((t) => t.isDebit)?._sum.amount ?? new Prisma.Decimal(0);

  const creditTotal = totals.find((t) => !t.isDebit)?._sum.amount ?? new Prisma.Decimal(0);

  const debitNormal = isDebitNormal(account.type);

  const netBalance = debitNormal ? debitTotal.sub(creditTotal) : creditTotal.sub(debitTotal);

  const balanceType = netBalance.greaterThanOrEqualTo(0)
    ? debitNormal
      ? 'Debit'
      : 'Credit'
    : debitNormal
      ? 'Credit'
      : 'Debit';

  return {
    debitTotal,
    creditTotal,

    balance: getSignedBalance(netBalance),

    balanceType,

    normalBalanceType: debitNormal ? 'Debit' : 'Credit',

    accountType: account.type,
  };
}
