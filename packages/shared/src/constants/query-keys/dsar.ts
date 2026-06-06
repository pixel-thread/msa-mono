export const DSAR_KEYS = {
  ALL:        () => ['dsar'] as const,
  TICKETS:    (options?: Record<string, unknown>) => ['dsar-tickets', options] as const,
  TICKET:     (id: string) => ['dsar-ticket', id] as const,
  SLA:        () => ['dsar-sla'] as const,
  MY:         () => ['dsar', 'my'] as const,
  MY_DETAIL:  (id: string) => ['dsar', 'my', 'detail', id] as const,
  DETAIL:     (id: string) => ['dsar', 'detail', id] as const,
  SLA_REPORT: () => ['dsar', 'sla-report'] as const,
}
