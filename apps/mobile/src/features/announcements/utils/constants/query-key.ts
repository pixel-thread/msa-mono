export const AnnouncementQueryKeys = {
  all: () => ['announcements'] as const,
  lists: () => [...AnnouncementQueryKeys.all(), 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...AnnouncementQueryKeys.lists(), filters] as const,
  details: () => [...AnnouncementQueryKeys.all(), 'detail'] as const,
  detail: (id: string) => [...AnnouncementQueryKeys.details(), id] as const,
};