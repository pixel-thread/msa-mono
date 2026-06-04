export const CONTRIBUTION = {
  DECLARATIONS: '/contributions/declarations',
  ALL_DECLARATIONS: '/contributions/all-declarations',
  APPROVE_DECLARATION: (id: string) => `/contributions/declarations/${id}/approve`,
  REJECT_DECLARATION: (id: string) => `/contributions/declarations/${id}/reject`,

  LIST: '/contributions/contributions',
  GENERATE: '/contributions/contributions',
  WAIVE: '/contributions/contributions',
  DETAIL: (id: string) => `/contributions/contributions/${id}`,

  USER: (userId: string) => `/contributions/users/${userId}`,

  CREATE_PAYMENT: '/contributions/payments',
} as const;
