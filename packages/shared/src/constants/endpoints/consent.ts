export const CONSENT = {
  MY: '/consent/my',
  GRANT: '/consent/grant',
  REVOKE: '/consent/revoke',
  ALL: '/consent/all',
  HISTORY: '/consent/history',
  REPORT: '/consent/report',
  USER_CONSENTS: (userId: string) => `/consent/users/${userId}`,
  RECEIPT: (receiptId: string) => `/consent/${receiptId}`,
} as const;
