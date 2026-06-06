export const PAYMENTS_KEYS = {
  ALL:             () => ['all-payments'] as const,
  LIST:            (params?: Record<string, unknown>) => ['all-payments', params] as const,
  DETAIL:          (id: string) => ['payment-detail', id] as const,
  USER_PAYMENTS:   (userId: string, page?: number) => ['user-payments', userId, page] as const,
  MEMBER_SEARCH:   (query: string) => ['member-search', query] as const,
  PROVIDERS:       () => ['payment-providers'] as const,
  PROVIDER:        (id: string) => ['payment-providers', id] as const,
  PROVIDER_STATUS: () => ['payment', 'provider', 'status'] as const,
}
