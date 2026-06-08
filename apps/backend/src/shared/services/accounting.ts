import { BadRequestError, NotFoundError } from '@errors';
import type { PaymentMethod, Prisma } from '@prisma/client';
import { ApprovalStatus } from '@prisma/client';

export interface JournalLine {
  accountCode: string;
  isDebit: boolean;
  amount: number;
}

export interface CreateEntryOptions {
  associationId: string;
  paymentTransactionId?: string;
  description: string;
  createdById: string;
  autoApprove?: boolean;
  approvedById?: string;
  lines: JournalLine[];
}

async function getAccountByCode(tx: Prisma.TransactionClient, associationId: string, code: string) {
  const account = await tx.account.findFirst({
    where: { associationId, code, isActive: true },
  });
  if (!account) throw new NotFoundError(`Account not found: ${code}`);
  return account;
}

function validateBalance(lines: { amount: number; isDebit: boolean }[]) {
  const totalDebits = lines.filter((l) => l.isDebit).reduce((s, l) => s + l.amount, 0);
  const totalCredits = lines.filter((l) => !l.isDebit).reduce((s, l) => s + l.amount, 0);
  if (Math.abs(totalDebits - totalCredits) > 0.001) {
    throw new BadRequestError(`Unbalanced entry: debits=${totalDebits}, credits=${totalCredits}`);
  }
}

export async function createJournalEntry(
  tx: Prisma.TransactionClient,
  options: CreateEntryOptions,
) {
  const {
    associationId,
    paymentTransactionId,
    description,
    createdById,
    autoApprove = false,
    approvedById,
    lines,
  } = options;

  // 1. Resolve account codes to IDs
  const resolvedLines = await Promise.all(
    lines.map(async (line) => {
      const account = await getAccountByCode(tx, associationId, line.accountCode);
      return {
        accountId: account.id,
        isDebit: line.isDebit,
        amount: line.amount,
        associationId,
      };
    }),
  );

  // 2. Validate balance
  validateBalance(resolvedLines);

  // 3. Check for existing (idempotency)
  if (paymentTransactionId) {
    const existing = await tx.ledgerEntry.findFirst({
      where: { paymentTransactionId },
    });
    if (existing) {
      return tx.ledgerEntry.findUnique({
        where: { id: existing.id },
        include: { lines: true },
      });
    }
  }

  // 4. Write to DB
  return tx.ledgerEntry.create({
    data: {
      paymentTransactionId: paymentTransactionId ?? null,
      description,
      approvalStatus: autoApprove ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING,
      createdById,
      approvedById: autoApprove ? (approvedById ?? 'system') : null,
      lines: {
        create: resolvedLines,
      },
    },
    include: { lines: true },
  });
}

type RecordMemberPaymentOpts = {
  associationId: string;
  paymentTransactionId: string;
  amount: number;
  description: string;
  createdById: string;
  method: PaymentMethod | string | null;
};

export async function recordMemberPayment(
  tx: Prisma.TransactionClient,
  opts: RecordMemberPaymentOpts,
) {
  const isCash = opts.method === 'CASH';
  const debitCode = isCash ? '1200' : '1000';

  return createJournalEntry(tx, {
    associationId: opts.associationId,
    paymentTransactionId: opts.paymentTransactionId,
    description: opts.description,
    createdById: opts.createdById,
    autoApprove: true,
    lines: [
      { accountCode: debitCode, isDebit: true, amount: opts.amount },
      { accountCode: '4000', isDebit: false, amount: opts.amount },
    ],
  });
}

type RecordRefundOpts = {
  associationId: string;
  paymentTransactionId: string;
  amount: number;
  description: string;
  createdById: string;
};

export async function recordRefund(tx: Prisma.TransactionClient, opts: RecordRefundOpts) {
  return createJournalEntry(tx, {
    associationId: opts.associationId,
    paymentTransactionId: opts.paymentTransactionId,
    description: `REFUND - ${opts.description}`,
    createdById: opts.createdById,
    autoApprove: true,
    lines: [
      { accountCode: '4000', isDebit: true, amount: opts.amount },
      { accountCode: '1000', isDebit: false, amount: opts.amount },
    ],
  });
}

export async function recordExpense(
  tx: Prisma.TransactionClient,
  opts: {
    associationId: string;
    amount: number;
    description: string;
    expenseAccountCode: string;
    createdById: string;
  },
) {
  return createJournalEntry(tx, {
    associationId: opts.associationId,
    description: opts.description,
    createdById: opts.createdById,
    autoApprove: false,
    lines: [
      { accountCode: opts.expenseAccountCode, isDebit: true, amount: opts.amount },
      { accountCode: '1000', isDebit: false, amount: opts.amount },
    ],
  });
}

type RecordWaiverOptions = {
  associationId: string;
  amount: number;
  memberId: string;
  period: string;
  approvedById: string;
};

export async function recordWaiver(tx: Prisma.TransactionClient, opts: RecordWaiverOptions) {
  return createJournalEntry(tx, {
    associationId: opts.associationId,
    description: `Dues waiver - ${opts.memberId} - ${opts.period}`,
    createdById: opts.approvedById,
    autoApprove: true,
    approvedById: opts.approvedById,
    lines: [
      { accountCode: '5100', isDebit: true, amount: opts.amount },
      { accountCode: '1100', isDebit: false, amount: opts.amount },
    ],
  });
}
