export const CONTRIBUTION = {
  DECLARATIONS: '/contributions/declarations',
  DECLARATION: (id: string) => `/contributions/declarations/${id}`,
  APPROVE_DECLARATION: (id: string) => `/contributions/declarations/${id}/approve`,
  REJECT_DECLARATION: (id: string) => `/contributions/declarations/${id}/reject`,

  LIST: '/contributions',
  MY: '/contributions/my',
  GENERATE: '/contributions/generate-periodic',
  WAIVE: '/contributions/waive',
  DETAIL: (id: string) => `/contributions/${id}`,

  USER: (userId: string) => `/contributions/users/${userId}`,

  RECORD_CONTRIBUTION: '/contributions/record',
} as const;
