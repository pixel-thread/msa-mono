export const ledgerEndpoints = {
  accounts: (page?: number) => `/ledger/accounts?page=${page ?? 1}` as const,
  accountsDetails: (id: string) => `/ledger/accounts/${id}` as const,
  summary: '/ledger/summary' as const,
  entries: '/ledger/entries' as const,
  approveEntry: (id: string) => `/ledger/entries/${id}/approve`,
} as const;
