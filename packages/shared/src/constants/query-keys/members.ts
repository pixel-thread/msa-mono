export const MEMBERS_KEYS = {
  ALL:    () => ['members'] as const,
  LIST:   (page?: number, status?: string) => ['members', page, status] as const,
  DETAIL: (id: string) => ['member', id] as const,
  TYPES:  () => ['member-types'] as const,
}
