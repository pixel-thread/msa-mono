import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsPage } from '@src/features/announcement/pages';

export const Route = createFileRoute('/_dashboard/announcement/draft')({
  component: AnnouncementsPage,
});
