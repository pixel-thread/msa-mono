import { AnnouncementsPage } from '@src/features/announcement/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/announcement/archived/')({
  component: () => <AnnouncementsPage status="ARCHIVED" />,
});
