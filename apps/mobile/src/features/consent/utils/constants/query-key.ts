export const ConsentQueryKeys = {
  all: (params?: Record<string, unknown>) => ['consent', 'all', params] as const,
  my: () => ['consent', 'my'] as const,
  history: () => ['consent', 'history'] as const,
  report: () => ['consent', 'report'] as const,
  grant: () => ['consent', 'grant'] as const,
  revoke: () => ['consent', 'revoke'] as const,
};
