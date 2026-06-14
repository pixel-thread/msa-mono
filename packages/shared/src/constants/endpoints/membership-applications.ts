export const MEMBERSHIP_APPLICATIONS = {
  ROOT: '/membership-applications',
  APPROVE: (applicationId: string) => `/membership-applications/${applicationId}/approve`,
  REJECT: (applicationId: string) => `/membership-applications/${applicationId}/reject`,
} as const;
