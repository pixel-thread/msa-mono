export const ANNOUNCEMENTS_KEYS = {
  ALL: () => ['announcements'].filter(Boolean),
  LISTS: () => ['announcements', 'list'].filter(Boolean),
  LIST: (...args: string[]) => ['announcements', 'list', ...args].filter(Boolean),
  DETAILS: (id: string) => ['announcements', 'detail', id].filter(Boolean),
  DETAIL: (id: string) => ['announcements', 'detail', id].filter(Boolean),
};
