import { createFileRoute } from '@tanstack/react-router';
import { ContributionsPage } from '@src/features/contributions/pages';

export const Route = createFileRoute('/_dashboard/contributions/')({
  component: ContributionsPage,
});
