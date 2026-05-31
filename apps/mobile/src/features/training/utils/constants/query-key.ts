export const TrainingQueryKeys = {
  all: (params?: Record<string, unknown>) => ['training', 'my', 'all', params] as const,
  detail: (id: string) => ['training', 'modules', 'detail', id] as const,
  create: () => ['training', 'modules', 'create'] as const,
  update: (id: string) => ['training', 'modules', 'update', id] as const,
  myCompletions: () => ['training', 'completions', 'my'] as const,
  allCompletions: (params?: Record<string, unknown>) =>
    ['training', 'completions', 'all', params] as const,
  complete: (moduleId: string) => ['training', 'modules', 'complete', moduleId] as const,
  assignments: (moduleId: string) => ['training', 'assignments', moduleId] as const,
  supplements: (moduleId: string) => ['training', 'supplements', moduleId] as const,
} as const;
