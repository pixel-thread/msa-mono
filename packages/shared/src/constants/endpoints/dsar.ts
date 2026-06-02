export const DSAR = {
  LIST: '/dsar',
  SUBMIT: '/dsar/submit',
  MY_LIST: '/dsar/my',
  MY_DETAIL: (ticketId: string) => `/dsar/my/${ticketId}`,
  ADMINS: '/dsar/admins',
  SLA_REPORT: '/dsar/sla-report',
  DETAIL: (ticketId: string) => `/dsar/${ticketId}`,
  RESPOND: (ticketId: string) => `/dsar/${ticketId}/respond`,
  ASSIGN: (ticketId: string) => `/dsar/${ticketId}/assign`,
  REJECT: (ticketId: string) => `/dsar/${ticketId}/reject`,
} as const;
