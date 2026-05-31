export const ComplianceQueryKeys = {
  all: (params?: Record<string, any>) => ['compliance', 'all', params] as const,
  my: () => ['compliance', 'my'] as const,
  myDetail: (id: string) => ['compliance', 'my', 'detail', id] as const,
};
