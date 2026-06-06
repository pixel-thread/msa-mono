import { createFileRoute } from '@tanstack/react-router';
import { UserPaymentsLookupPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/users/')({
  component: UserPaymentsLookupPage,
});
