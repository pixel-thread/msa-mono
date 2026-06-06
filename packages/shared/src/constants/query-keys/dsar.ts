export const DSAR_KEYS = {
  ALL:        () => ['dsar'].filter(Boolean),
  TICKETS:    (options?: unknown) => ['dsar-tickets', options].filter(Boolean),
  TICKET:     (id: string) => ['dsar-ticket', id].filter(Boolean),
  SLA:        () => ['dsar-sla'].filter(Boolean),
  MY:         () => ['dsar', 'my'].filter(Boolean),
  MY_DETAIL:  (id: string) => ['dsar', 'my', 'detail', id].filter(Boolean),
  DETAIL:     (id: string) => ['dsar', 'detail', id].filter(Boolean),
  SLA_REPORT: () => ['dsar', 'sla-report'].filter(Boolean),
}
