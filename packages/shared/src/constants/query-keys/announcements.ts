export const ANNOUNCEMENTS_KEYS = {
  ALL:     () => ['announcements'].filter(Boolean),
  LISTS:   () => ['announcements', 'list'].filter(Boolean),
  LIST:    (filters?: unknown) => ['announcements', 'list', filters].filter(Boolean),
  DETAILS: () => ['announcements', 'detail'].filter(Boolean),
  DETAIL:  (id: string) => ['announcements', 'detail', id].filter(Boolean),
}
