import { IArgs } from '@repo/types';
export const TRAINING_KEYS = {
  MODULES: () => ['training-modules'].filter(Boolean),
  MODULES_LIST: (...args: IArgs[]) => ['training-modules', ...args].filter(Boolean),
  MODULE: (id: string) => ['training-module', id].filter(Boolean),
  SUPPLEMENTS: (...args: IArgs[]) => ['training-supplements', ...args].filter(Boolean),
  ASSIGNMENTS: (...moduleId: IArgs[]) => ['training-assignments', ...moduleId].filter(Boolean),
  ASSIGNED_USERS: (...args: IArgs[]) => ['module-assigned-users', ...args].filter(Boolean),
  ASSIGNED_USERS_BASE: () => ['module-assigned-users'].filter(Boolean),
  COMPLETIONS_ADMIN: () => ['admin-training-completions'].filter(Boolean),
  COMPLETIONS_ADMIN_LIST: (page?: number) => ['admin-training-completions', page].filter(Boolean),
  COMPLETIONS_MY: () => ['my-training-completions'].filter(Boolean),
  COMPLETIONS_BY_MODULE: (moduleId: string, page?: number) =>
    ['training-completions', moduleId, page].filter(Boolean),
  CERTIFICATES: (...args: IArgs[]) => ['training-certificates', ...args].filter(Boolean),
  MY_ALL: (params?: unknown) => ['training', 'my', 'all', params].filter(Boolean),
  MODULE_DETAIL: (...args: IArgs[]) => ['training', 'modules', 'detail', ...args].filter(Boolean),
  MODULE_CREATE: () => ['training', 'modules', 'create'].filter(Boolean),
  MODULE_UPDATE: (id: string) => ['training', 'modules', 'update', id].filter(Boolean),
  COMPLETE: (moduleId: string) => ['training', 'modules', 'complete', moduleId].filter(Boolean),
};
