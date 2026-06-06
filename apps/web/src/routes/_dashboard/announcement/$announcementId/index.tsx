import { createFileRoute } from '@tanstack/react-router';
import AnnouncementDetailPage from '@src/features/announcement/pages/announcement-detail';

export const Route = createFileRoute('/_dashboard/announcement/$announcementId')({
  component: AnnouncementDetailPage,
});
