export const MEMBERS = {
  ROOT: '/members',
  DETAILS: (id: string) => `/members/${id}`,
  STATUS: (id: string) => `/members/${id}/status`,
  SUSPEND: (id: string) => `/members/${id}/suspend`,
  ROLE: (id: string) => `/members/${id}/role`,
  LEDGER: (id: string) => `/members/${id}/ledger`,
  ONBOARDING: '/members/onboarding',
} as const;
