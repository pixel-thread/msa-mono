export const COMPLIANCE_KEYS = {
  ALL:       () => ['compliance'].filter(Boolean),
  CHECKS:    (options?: unknown) => ['compliance-checks', options].filter(Boolean),
  CHECK:     (id: string | null) => ['compliance-check', id].filter(Boolean),
  EVIDENCE:  () => ['compliance-evidence'].filter(Boolean),
  MY:        () => ['compliance', 'my'].filter(Boolean),
  MY_DETAIL: (id: string) => ['compliance', 'my', 'detail', id].filter(Boolean),
}
