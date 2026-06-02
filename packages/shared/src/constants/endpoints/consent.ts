export const CONSENT = {
  MY: '/api/v1/consent/my',
  GRANT: '/api/v1/consent/grant',
  REVOKE: '/api/v1/consent/revoke',
  ALL: '/api/v1/consent/all',
  HISTORY: '/api/v1/consent/history',
  REPORT: '/api/v1/consent/report',
  USER_CONSENTS: (userId: string) => `/api/v1/consent/users/${userId}`,
  RECEIPT: (receiptId: string) => `/api/v1/consent/${receiptId}`,
} as const;
