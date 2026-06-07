import { RecordContributionPage } from '@src/features/contributions/pages/record-contribution';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/contributions/record/')({
  component: RecordContributionPage,
});
