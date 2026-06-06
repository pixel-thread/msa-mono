export const AUDIT_LOGS_KEYS = {
  ALL:  () => ['audit-logs'].filter(Boolean),
  LIST: (params?: unknown) => ['audit-logs', params].filter(Boolean),
}
