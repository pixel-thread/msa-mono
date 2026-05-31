export const dsarEndpoints = {
  submit: '/dsar/submit',
  my: '/dsar/my',
  myDetail: (id: string) => `/dsar/my/${id}`,
  cancel: (id: string) => `/dsar/my/${id}/cancel`,
  list: '/dsar',
  detail: (id: string) => `/dsar/${id}`,
  respond: (id: string) => `/dsar/${id}/respond`,
  assign: (id: string) => `/dsar/${id}/assign`,
  slaReport: '/dsar/sla-report',
} as const;
