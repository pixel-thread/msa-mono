export const ledgerEndpoints = {
  entries: '/ledger/entries',
  accounts: '/ledger/accounts',
  summary: '/ledger/summary',
  seedAccounts: '/ledger/accounts/seed',
  rejectEntry: (id: string) => `/ledger/entries/${id}/reject`,
  approveEntry: (id: string) => `/ledger/entries/${id}/approve`,
  updateAccount: (id: string) => `/ledger/accounts/${id}`,
  accountsDetails: (id: string) => `/ledger/accounts/${id}`,
  trialBalance: '/ledger/reports/trial-balance',
  incomeStatement: '/ledger/reports/income-statement',
};

