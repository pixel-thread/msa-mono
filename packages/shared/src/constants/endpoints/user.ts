export const USER = {
  PROFILE: '/api/v1/user',
  MFA: '/api/v1/user/mfa',
  INVOICES: '/api/v1/user/invoices',
  INVOICE_DETAILS: (invoiceId: string) => `/api/v1/user/invoices/${invoiceId}`,
} as const;
