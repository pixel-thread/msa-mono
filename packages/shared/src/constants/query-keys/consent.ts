export const CONSENT_KEYS = {
  ALL:     () => ['consent'] as const,
  RECORDS: (options?: unknown) => ['consent-records', options] as const,
  REPORT:  () => ['consent-report'] as const,
  HISTORY: (userId?: string | null) => ['consent-history', userId] as const,
  MY:      () => ['consent', 'my'] as const,
  GRANT:   () => ['consent', 'grant'] as const,
  REVOKE:  () => ['consent', 'revoke'] as const,
}
