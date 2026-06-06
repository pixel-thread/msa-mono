export const CONSENT_KEYS = {
  ALL:     () => ['consent'].filter(Boolean),
  RECORDS: (options?: unknown) => ['consent-records', options].filter(Boolean),
  REPORT:  () => ['consent-report'].filter(Boolean),
  HISTORY: (userId?: string | null) => ['consent-history', userId].filter(Boolean),
  MY:      () => ['consent', 'my'].filter(Boolean),
  GRANT:   () => ['consent', 'grant'].filter(Boolean),
  REVOKE:  () => ['consent', 'revoke'].filter(Boolean),
}
