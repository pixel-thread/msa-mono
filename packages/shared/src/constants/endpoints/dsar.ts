export const DSAR = {
  LIST: '/api/v1/dsar',
  SUBMIT: '/api/v1/dsar/submit',
  MY_LIST: '/api/v1/dsar/my',
  MY_DETAIL: (ticketId: string) => `/api/v1/dsar/my/${ticketId}`,
  ADMINS: '/api/v1/dsar/admins',
  SLA_REPORT: '/api/v1/dsar/sla-report',
  DETAIL: (ticketId: string) => `/api/v1/dsar/${ticketId}`,
  RESPOND: (ticketId: string) => `/api/v1/dsar/${ticketId}/respond`,
  ASSIGN: (ticketId: string) => `/api/v1/dsar/${ticketId}/assign`,
  REJECT: (ticketId: string) => `/api/v1/dsar/${ticketId}/reject`,
} as const;
