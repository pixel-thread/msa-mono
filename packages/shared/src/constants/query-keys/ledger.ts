export const LEDGER_KEYS = {
  ACCOUNTS:          () => ['ledger-accounts'] as const,
  ACCOUNTS_LIST:     (page?: number) => ['ledger-accounts', page] as const,
  ACCOUNT:           (id: string) => ['ledger-account', id] as const,
  ENTRIES:           () => ['ledger-entries'] as const,
  ENTRIES_LIST:      (page?: number) => ['ledger-entries', page] as const,
  SUMMARY:           () => ['ledger-summary'] as const,
  TRIAL_BALANCE:     () => ['trial-balance'] as const,
  INCOME_STATEMENT:  (startDate?: string, endDate?: string) =>
    ['income-statement', startDate, endDate] as const,
}
