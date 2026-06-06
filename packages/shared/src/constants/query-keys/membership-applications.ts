export const MEMBERSHIP_APPLICATIONS_KEYS = {
  ALL:  () => ['membership-applications'].filter(Boolean),
  LIST: (page?: number, status?: string) => ['membership-applications', page, status].filter(Boolean),
}
