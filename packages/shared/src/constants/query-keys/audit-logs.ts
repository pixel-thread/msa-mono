export const AUDIT_LOGS_KEYS = {
  ALL:  () => ['audit-logs'] as const,
  LIST: (params?: unknown) => ['audit-logs', params] as const,
}
