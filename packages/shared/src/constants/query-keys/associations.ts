export const ASSOCIATIONS_KEYS = {
  ALL:     () => ['associations'] as const,
  LIST:    () => ['associations-list'] as const,
  CURRENT: () => ['associations', 'current'] as const,
}
