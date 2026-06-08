import { NotFoundError } from '@errors';
import type { Prisma } from '@prisma/client';
import { createJournalEntry } from '@services/accounting';

type TransferBalanceOptions = {
  associationId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  description: string;
  createdById: string;
};

export async function transferBalance(tx: Prisma.TransactionClient, opts: TransferBalanceOptions) {
  const [sourceAccount, destinationAccount] = await Promise.all([
    tx.account.findFirst({
      where: { id: opts.sourceAccountId, associationId: opts.associationId, isActive: true },
    }),
    tx.account.findFirst({
      where: { id: opts.destinationAccountId, associationId: opts.associationId, isActive: true },
    }),
  ]);

  if (!sourceAccount) {
    throw new NotFoundError(`Source account not found or inactive: ${opts.sourceAccountId}`);
  }
  if (!destinationAccount) {
    throw new NotFoundError(
      `Destination account not found or inactive: ${opts.destinationAccountId}`,
    );
  }

  return createJournalEntry(tx, {
    associationId: opts.associationId,
    description: opts.description,
    createdById: opts.createdById,
    autoApprove: false,
    lines: [
      { accountCode: sourceAccount.code, isDebit: true, amount: opts.amount },
      { accountCode: destinationAccount.code, isDebit: false, amount: opts.amount },
    ],
  });
}
