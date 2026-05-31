export const trainingEndpoints = {
  modules: '/training/modules',
  getModule: (id: string) => `/training/modules/${id}`,
  complete: (id: string) => `/training/modules/${id}/complete`,
  myCompletions: '/training/my-completions',
  myTrainings: '/training/my-assignments',
  assign: (moduleId: string) => `/training/modules/${moduleId}/assign`,
  supplements: (moduleId: string) => `/training/modules/${moduleId}/supplements`,
} as const;
