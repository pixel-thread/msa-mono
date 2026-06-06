export const AUDIT_LOGS_KEYS = {
  ALL:  () => ['audit-logs'] as const,
  LIST: (params?: Record<string, unknown>) => ['audit-logs', params] as const,
}
