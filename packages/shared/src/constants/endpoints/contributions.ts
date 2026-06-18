export const CONTRIBUTION = {
  LIST: '/contributions',
  MY: '/contributions/my',
  MY_OVERVIEW: '/contributions/my/overview',
  GENERATE: '/contributions/generate-periodic',
  WAIVE: '/contributions/waive',
  DETAIL: (id: string) => `/contributions/${id}`,

  USER: (userId: string) => `/contributions/users/${userId}`,

  RECORD_CONTRIBUTION: '/contributions/record',
  RETROACTIVE_USERS: '/contributions/retroactive/affected-users',
} as const;
