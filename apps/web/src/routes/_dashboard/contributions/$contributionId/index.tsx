import { ContributionDetailPage } from '@src/features/contributions/pages/contribution-detail';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/contributions/$contributionId/')({
  component: ContributionDetailPage,
});
