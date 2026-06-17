export const CONTRIBUTION = {
  LIST: '/contributions',
  MY: '/contributions/my',
  GENERATE: '/contributions/generate-periodic',
  WAIVE: '/contributions/waive',
  DETAIL: (id: string) => `/contributions/${id}`,

  USER: (userId: string) => `/contributions/users/${userId}`,

  RECORD_CONTRIBUTION: '/contributions/record',
} as const;
