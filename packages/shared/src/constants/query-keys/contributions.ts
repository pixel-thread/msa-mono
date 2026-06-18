export const CONTRIBUTIONS_KEYS = {
  ALL: () => ['all-contributions'].filter(Boolean),
  USER_BASE: () => ['user-contributions'].filter(Boolean),
  LIST: (status?: string, userId?: string, year?: number, month?: number) =>
    ['all-contributions', status, userId, year, month].filter(Boolean),
  USER: (
    userId: string,
    fromYear?: number,
    fromMonth?: number,
    toYear?: number,
    toMonth?: number,
    page?: number,
  ) => ['user-contributions', userId, fromYear, fromMonth, toYear, toMonth, page].filter(Boolean),
  DETAIL: (id: string) => ['contribution-detail', id].filter(Boolean),
};
