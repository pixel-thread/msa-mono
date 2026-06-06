import { createFileRoute } from '@tanstack/react-router';
import { ContributionDetailPage } from '@src/features/contributions/pages/contribution-detail';

export const Route = createFileRoute('/_dashboard/contributions/$contributionId/')({
  component: ContributionDetailPage,
});
