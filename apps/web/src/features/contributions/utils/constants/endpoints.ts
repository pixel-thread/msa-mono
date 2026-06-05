export const contributionEndpoints = {
  base: '/payments/contributions' as const,
  byId: (id: string) => `/payments/contributions/${id}`,
  userContributions: (userId: string) => `/payments/users/${userId}/contributions`,
  createPayment: '/contributions/payments' as const,
} as const;

export const declarationEndpoints = {
  list: '/declarations' as const,
  byId: (id: string) => `/declarations/${id}`,
  approve: (id: string) => `/declarations/${id}/approve`,
  reject: (id: string) => `/declarations/${id}/reject`,
} as const;
