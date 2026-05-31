export const paymentEndpoints = {
  get: (id: string) => `/payments/${id}`,
  receipt: (id: string) => `/payments/${id}/receipt`,
  my: '/payments/my',
  stats: '/payments/stats',
  collectionsReport: '/payments/reports/collections',
} as const;