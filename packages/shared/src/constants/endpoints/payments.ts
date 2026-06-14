export const PAYMENTS = {
  LIST: '/payments',
  MY: '/payments/my',
  HISTORY: '/payments/history',
  STATS: '/payments/stats',
  DETAIL: (id: string) => `/payments/${id}`,
  RECEIPT: (id: string) => `/payments/${id}/receipt`,
  TRANSFER: '/payments/transfer',
  TRANSFER_REFERENCE_FILE: (entryId: string) => `/payments/transfer/${entryId}/references/files`,
  RECORD: '/payments/record',
  RAZORPAY: {
    CREATE_ORDER: '/payments/order',
    VERIFY: '/payments/verify',
    WEBHOOK: '/payments/webhook',
  },

  USERS: {
    BY_ID: (userId: string) => `/payments/users/${userId}`,
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
