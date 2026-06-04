export const TRAINING = {
  MODULES: '/training/modules',
  MODULE_DETAIL: (id: string) => `/training/modules/${id}`,
  MODULE_ASSIGN: (id: string) => `/training/modules/${id}/assign`,
  MODULE_ASSIGNED_USERS: (id: string) => `/training/modules/${id}/assigned-users`,
  MODULE_COMPLETE: (id: string) => `/training/modules/${id}/complete`,
  MODULE_COMPLETE_USER: (moduleId: string, userId: string) =>
    `/training/modules/${moduleId}/assignments/${userId}/complete`,
  MODULE_CERTIFICATES: (id: string) => `/training/modules/${id}/certificates`,
  MODULE_CERTIFICATE_DETAIL: (moduleId: string, certId: string) =>
    `/training/modules/${moduleId}/certificates/${certId}`,
  MODULE_CERTIFICATE_TEMPLATE: (id: string) => `/training/modules/${id}/certificate-template`,
  MODULE_SUPPLEMENTS: (id: string) => `/training/modules/${id}/supplements`,
  MODULE_SUPPLEMENT_DETAIL: (moduleId: string, supplementId: string) =>
    `/training/modules/${moduleId}/supplements/${supplementId}`,
  MY_ASSIGNMENTS: '/training/my-assignments',
  MY_COMPLETIONS: '/training/my-completions',
  COMPLETIONS: '/training/completions',
} as const;
