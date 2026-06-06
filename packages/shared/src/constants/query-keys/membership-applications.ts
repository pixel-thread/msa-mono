export const MEMBERSHIP_APPLICATIONS_KEYS = {
  ALL:  () => ['membership-applications'] as const,
  LIST: (page?: number, status?: string) => ['membership-applications', page, status] as const,
}
