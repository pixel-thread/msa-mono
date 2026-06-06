import { createFileRoute } from '@tanstack/react-router';
import { UserContributionsPage } from '@src/features/contributions/pages';

export const Route = createFileRoute('/_dashboard/payments/users/$userId/contributions/')({
  component: UserContributionsPage,
});
