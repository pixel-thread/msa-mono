export const DECLARATION = {
  LIST: '/declarations',
  DETAIL: (id: string) => `/declarations/${id}`,
  APPROVE: (id: string) => `/declarations/${id}/approve`,
  REJECT: (id: string) => `/declarations/${id}/reject`,
} as const;
