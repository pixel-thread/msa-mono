export const MEMBERS_KEYS = {
  ALL:    () => ['members'].filter(Boolean),
  LIST:   (page?: number, status?: string) => ['members', page, status].filter(Boolean),
  DETAIL: (id: string) => ['member', id].filter(Boolean),
  TYPES:  () => ['member-types'].filter(Boolean),
}
