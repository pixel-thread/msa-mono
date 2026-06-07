import AnnouncementDetailPage from '@src/features/announcement/pages/announcement-detail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/announcement/$announcementId/')({
  component: AnnouncementDetailPage,
});
