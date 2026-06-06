export const ANNOUNCEMENTS_KEYS = {
  ALL:     () => ['announcements'] as const,
  LISTS:   () => ['announcements', 'list'] as const,
  LIST:    (filters?: Record<string, unknown>) => ['announcements', 'list', filters] as const,
  DETAILS: () => ['announcements', 'detail'] as const,
  DETAIL:  (id: string) => ['announcements', 'detail', id] as const,
}
