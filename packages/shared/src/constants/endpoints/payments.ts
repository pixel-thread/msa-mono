export const PAYMENTS = {
  LIST: '/payments',
  MY: '/payments/my',
  HISTORY: '/payments/history',
  STATS: '/payments/stats',
  DETAIL: (id: string) => `/payments/${id}`,
  RECEIPT: (id: string) => `/payments/${id}/receipt`,
  
  RAZORPAY: {
    CREATE_ORDER: '/payments/order',
    VERIFY: '/payments/verify',
    WEBHOOK: '/payments/webhook',
    RECORD: '/payments/record',
  },

  USERS: {
    BY_ID: (userId: string) => `/payments/users/${userId}`,
    CONTRIBUTIONS: (userId: string) => `/payments/users/${userId}/contributions`,
  },

  CONTRIBUTIONS: {
    LIST: '/payments/contributions',
    GENERATE: '/payments/contributions',
    WAIVE: '/payments/contributions',
    DETAIL: (id: string) => `/payments/contributions/${id}`,
  },

  REPORTS: {
    COLLECTIONS: '/payments/reports/collections',
  },

  PROVIDERS: {
    LIST: '/payments/providers',
    CREATE: '/payments/providers',
    STATUS: '/payments/providers/status',
    DETAIL: (id: string) => `/payments/providers/${id}`,
    UPDATE: (id: string) => `/payments/providers/${id}`,
    DELETE: (id: string) => `/payments/providers/${id}`,
    ACTIVATE: (id: string) => `/payments/providers/${id}/activate`,
    TEST: (id: string) => `/payments/providers/${id}/test`,
    TEST_VERIFY: (id: string) => `/payments/providers/${id}/test/verify`,
  },
} as const;
