export const ASSOCIATIONS_KEYS = {
  ALL:     () => ['associations'] as const,
  CURRENT: () => ['associations', 'current'] as const,
}
