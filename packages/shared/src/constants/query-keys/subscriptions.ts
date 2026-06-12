export const PLANS_KEYS = {
  ALL:             () => ['plans'].filter(Boolean),
  PLANS:           (page?: number) => ['plans', page].filter(Boolean),
  PLAN:            (id: string) => ['plan', id].filter(Boolean),
}
