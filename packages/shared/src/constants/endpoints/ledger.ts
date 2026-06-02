export const LEDGER = {
  ACCOUNTS: '/api/v1/ledger/accounts',
  ACCOUNT_DETAIL: (id: string) => `/api/v1/ledger/accounts/${id}`,
  SEED_ACCOUNTS: '/api/v1/ledger/accounts/seed',
  ENTRIES: '/api/v1/ledger/entries',
  APPROVE_ENTRY: (entryId: string) => `/api/v1/ledger/entries/${entryId}/approve',
  REJECT_ENTRY: (entryId: string) => `/api/v1/ledger/entries/${entryId}/reject',
  SUMMARY: '/api/v1/ledger/summary',
  TRIAL_BALANCE: '/api/v1/ledger/reports/trial-balance',
  INCOME_STATEMENT: '/api/v1/ledger/reports/income-statement',
  MEMBER_LEDGER: (memberId: string) => `/api/v1/ledger/member/${memberId}`,
} as const;
