export const ASSOCIATIONS = {
  ROOT: '/associations',
  CURRENT: '/associations/current',
  DETAIL: (id: string) => `/associations/${id}`,
  DEACTIVATE: (id: string) => `/associations/${id}/deactivate`,
  LOGO: (id: string) => `/associations/${id}/logo`,
  MEMBERS: (id: string) => `/associations/${id}/members`,
} as const;
