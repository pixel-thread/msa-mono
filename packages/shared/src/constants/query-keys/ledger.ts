export const LEDGER_KEYS = {
  ACCOUNTS: () => ['ledger-accounts'].filter(Boolean),
  ACCOUNTS_LIST: (page?: number) => ['ledger-accounts', page].filter(Boolean),
  ACCOUNT: (id: string) => ['ledger-account', id].filter(Boolean),
  ENTRIES: () => ['ledger-entries'].filter(Boolean),
  ENTRIES_LIST: (page?: number) => ['ledger-entries', page].filter(Boolean),
  SUMMARY: () => ['ledger-summary'].filter(Boolean),
  TRIAL_BALANCE: () => ['trial-balance'].filter(Boolean),
  INCOME_STATEMENT: (startDate?: string, endDate?: string) =>
    ['income-statement', startDate, endDate].filter(Boolean),
} as const;
