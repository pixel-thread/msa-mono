export const MEMBER_TYPES = {
  ROOT: '/member-types',
  DETAIL: (id: string) => `/member-types/${id}`,
} as const;
