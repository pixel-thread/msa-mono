import { NotFoundError } from '@errors';
import type { DocumentReferenceType, Prisma } from '@prisma/client';
import { createJournalEntry } from '@services/accounting';

type TransferBalanceOptions = {
  associationId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  description: string;
  createdById: string;
  reference: string;
  referenceType: DocumentReferenceType;
};

function isDebitNormal(type: string): boolean {
  return type === 'ASSET' || type === 'EXPENSE';
}

export async function transferBalance(tx: Prisma.TransactionClient, opts: TransferBalanceOptions) {
  const [sourceAccount, destinationAccount] = await Promise.all([
    tx.account.findFirst({
      where: {
        id: opts.sourceAccountId,
        associationId: opts.associationId,
        isActive: true,
      },
    }),

    tx.account.findFirst({
      where: {
        id: opts.destinationAccountId,
        associationId: opts.associationId,
        isActive: true,
      },
    }),
  ]);

  if (!sourceAccount) {
    throw new NotFoundError(`Source account not found: ${opts.sourceAccountId}`);
  }

  if (!destinationAccount) {
    throw new NotFoundError(`Destination account not found: ${opts.destinationAccountId}`);
  }

  if (isDebitNormal(sourceAccount.type) !== isDebitNormal(destinationAccount.type)) {
    throw new Error(`Cannot transfer between ${sourceAccount.type} and ${destinationAccount.type}`);
  }

  const debitNormalAccounts = isDebitNormal(sourceAccount.type);

  if (debitNormalAccounts) {
    // Asset/Expense
    //
    // Cash -> Bank
    // Cr Cash
    // Dr Bank

    return createJournalEntry(tx, {
      associationId: opts.associationId,
      description: opts.description,
      createdById: opts.createdById,
      autoApprove: true,

      lines: [
        {
          accountCode: sourceAccount.code,
          isDebit: false,
          amount: opts.amount,
        },
        {
          accountCode: destinationAccount.code,
          isDebit: true,
          amount: opts.amount,
        },
      ],
    });
  }

  // Liability/Equity/Income
  //
  // Reverse direction

  return createJournalEntry(tx, {
    associationId: opts.associationId,
    description: opts.description,
    createdById: opts.createdById,
    autoApprove: true,

    lines: [
      {
        accountCode: sourceAccount.code,
        isDebit: true,
        amount: opts.amount,
      },
      {
        accountCode: destinationAccount.code,
        isDebit: false,
        amount: opts.amount,
      },
    ],
  });
}
