export const PAYMENTS_KEYS = {
  ALL:             () => ['all-payments'].filter(Boolean),
  LIST:            (params?: unknown) => ['all-payments', params].filter(Boolean),
  DETAIL:          (id: string) => ['payment-detail', id].filter(Boolean),
  USER_PAYMENTS:   (userId: string, page?: number) => ['user-payments', userId, page].filter(Boolean),
  MEMBER_SEARCH:   (query: string) => ['member-search', query].filter(Boolean),
  PROVIDERS:       () => ['payment-providers'].filter(Boolean),
  PROVIDER:        (id: string) => ['payment-providers', id].filter(Boolean),
  PROVIDER_STATUS: () => ['payment', 'provider', 'status'].filter(Boolean),
}
