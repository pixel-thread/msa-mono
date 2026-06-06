export const CONTRIBUTIONS_KEYS = {
  ALL:          () => ['all-contributions'] as const,
  USER_BASE:    () => ['user-contributions'] as const,
  LIST:         (page?: number, status?: string, userId?: string, year?: number, month?: number) =>
    ['all-contributions', page, status, userId, year, month] as const,
  USER:         (userId: string, fromYear?: number, fromMonth?: number, toYear?: number, toMonth?: number, page?: number) =>
    ['user-contributions', userId, fromYear, fromMonth, toYear, toMonth, page] as const,
  DETAIL:       (id: string) => ['contribution-detail', id] as const,
  DECLARATIONS: (page?: number, status?: string, search?: string) =>
    ['declarations', page, status, search] as const,
  DECLARATION:  (id: string) => ['declaration', id] as const,
}
