import { QUERY_KEYS } from '@repo/shared';

export const trainingQueryKeys = {
  modules: {
    all: (page?: number) => QUERY_KEYS.TRAINING_KEYS.MODULES_LIST(page),
    list: (page?: number, isActive?: boolean) =>
      QUERY_KEYS.TRAINING_KEYS.MODULES_LIST(page, isActive),
    detail: (id: string) => QUERY_KEYS.TRAINING_KEYS.MODULE(id),
  },
  supplements: {
    all: (moduleId: string, page?: number) => QUERY_KEYS.TRAINING_KEYS.SUPPLEMENTS(moduleId, page),
  },
  assignments: {
    all: (moduleId: string, page?: number) => QUERY_KEYS.TRAINING_KEYS.ASSIGNMENTS(moduleId, page),
  },
  assignedUsers: {
    all: (moduleId: string, page?: number) =>
      QUERY_KEYS.TRAINING_KEYS.ASSIGNED_USERS(moduleId, page),
    base: () => QUERY_KEYS.TRAINING_KEYS.ASSIGNED_USERS_BASE(),
  },
  completions: {
    admin: () => QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_ADMIN(),
    adminList: (page?: number) => QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_ADMIN_LIST(page),
    my: () => QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_MY(),
    byModule: (moduleId: string, page?: number) =>
      QUERY_KEYS.TRAINING_KEYS.COMPLETIONS_BY_MODULE(moduleId, page),
  },
  certificates: {
    all: (moduleId: string) => QUERY_KEYS.TRAINING_KEYS.CERTIFICATES(moduleId),
  },
};
