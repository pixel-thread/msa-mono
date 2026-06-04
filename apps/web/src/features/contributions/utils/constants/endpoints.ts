export const contributionEndpoints = {
  base: '/payments/contributions' as const,
  byId: (id: string) => `/payments/contributions/${id}`,
  userContributions: (userId: string) => `/payments/users/${userId}/contributions`,
  createPayment: '/contributions/payments' as const,
} as const;
