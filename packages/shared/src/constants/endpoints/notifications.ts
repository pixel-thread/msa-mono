export const NOTIFICATIONS = {
  REGISTER: '/notifications/register',
  LINK: '/notifications/link',
  STATUS: (id: string) => `/notifications/${id}/status`,
} as const;
