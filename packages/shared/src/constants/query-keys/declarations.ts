export const DECLARATIONS_KEYS = {
  LIST: (page?: number, status?: string, search?: string) =>
    ['declarations', page, status, search].filter(Boolean),
  DETAIL: (id: string) => ['declaration', id].filter(Boolean),
}
