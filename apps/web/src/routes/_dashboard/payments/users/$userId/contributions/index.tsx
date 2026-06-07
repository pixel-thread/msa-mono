import { UserContributionsPage } from '@src/features/contributions/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/payments/users/$userId/contributions/')({
  component: UserContributionsPage,
});
