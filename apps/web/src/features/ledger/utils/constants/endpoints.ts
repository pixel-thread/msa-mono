export const ledgerEndpoints = {
  entries: '/api/ledger/entries',
  accounts: '/api/ledger/accounts',
  summary: '/api/ledger/summary',
  seedAccounts: '/api/ledger/accounts/seed',
  rejectEntry: (id: string) => `/api/ledger/entries/${id}/reject`,
  approveEntry: (id: string) => `/api/ledger/entries/${id}/approve`,
  updateAccount: (id: string) => `/api/ledger/accounts/${id}`,
  trialBalance: '/api/ledger/reports/trial-balance',
  incomeStatement: '/api/ledger/reports/income-statement',
};