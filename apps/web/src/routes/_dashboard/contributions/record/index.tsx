import { createFileRoute } from '@tanstack/react-router';
import { RecordContributionPage } from '@src/features/contributions/pages/record-contribution';

export const Route = createFileRoute('/_dashboard/contributions/record/')({
  component: RecordContributionPage,
});
