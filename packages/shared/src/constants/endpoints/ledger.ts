export const LEDGER = {
  ACCOUNTS: '/ledger/accounts',
  ACCOUNT_DETAIL: (id: string) => `/ledger/accounts/${id}`,
  SEED_ACCOUNTS: '/ledger/accounts/seed',
  ENTRIES: '/ledger/entries',
  APPROVE_ENTRY: (entryId: string) => `/ledger/entries/${entryId}/approve',
  REJECT_ENTRY: (entryId: string) => `/ledger/entries/${entryId}/reject',
  SUMMARY: '/ledger/summary',
  TRIAL_BALANCE: '/ledger/reports/trial-balance',
  INCOME_STATEMENT: '/ledger/reports/income-statement',
  MEMBER_LEDGER: (memberId: string) => `/ledger/member/${memberId}`,
} as const;
