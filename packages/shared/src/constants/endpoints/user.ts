export const USER = {
  PROFILE: '/user',
  MFA: '/user/mfa',
  INVOICES: '/user/invoices',
  INVOICE_DETAILS: (invoiceId: string) => `/user/invoices/${invoiceId}`,
} as const;
