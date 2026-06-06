export const COMPLIANCE_KEYS = {
  ALL:       () => ['compliance'] as const,
  CHECKS:    (options?: unknown) => ['compliance-checks', options] as const,
  CHECK:     (id: string | null) => ['compliance-check', id] as const,
  EVIDENCE:  () => ['compliance-evidence'] as const,
  MY:        () => ['compliance', 'my'] as const,
  MY_DETAIL: (id: string) => ['compliance', 'my', 'detail', id] as const,
}
