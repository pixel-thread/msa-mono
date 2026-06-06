import { prisma } from '@lib/prisma';

export async function seedChartOfAccounts(associationId: string) {
  const accounts = [
    { code: '1000', name: 'Bank Account',        type: 'ASSET' },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
    { code: '1200', name: 'Cash on Hand',        type: 'ASSET' },
    { code: '2000', name: 'Unearned Revenue',    type: 'LIABILITY' },
    { code: '2100', name: 'Member Deposits',     type: 'LIABILITY' },
    { code: '3000', name: 'Retained Earnings',   type: 'EQUITY' },
    { code: '4000', name: 'Subscription Income', type: 'INCOME' },
    { code: '4100', name: 'Event Fee Income',    type: 'INCOME' },
    { code: '4200', name: 'Donation Income',     type: 'INCOME' },
    { code: '4300', name: 'Bank Interest',       type: 'INCOME' },
    { code: '5000', name: 'Office Expense',      type: 'EXPENSE' },
    { code: '5100', name: 'Waiver Expense',      type: 'EXPENSE' },
    { code: '5200', name: 'Refund Expense',      type: 'EXPENSE' },
  ];

  await prisma.account.createMany({
    data: accounts.map(a => ({ ...a, associationId, isActive: true })),
    skipDuplicates: true,
  });
}
