export const COMPLIANCE = {
  LIST: '/compliance',
  CREATE: '/compliance',
  CHECKS: '/compliance/checks',
  CHECK_DETAIL: (checkId: string) => `/compliance/checks/${checkId}`,
  EVIDENCE: '/compliance/evidence',
  MY_LIST: '/compliance/my',
  MY_DETAIL: (complaintId: string) => `/compliance/my/${complaintId}`,
} as const;
