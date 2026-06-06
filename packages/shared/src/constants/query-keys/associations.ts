export const ASSOCIATIONS_KEYS = {
  ALL:     () => ['associations'].filter(Boolean),
  LIST:    () => ['associations-list'].filter(Boolean),
  CURRENT: () => ['associations', 'current'].filter(Boolean),
}
