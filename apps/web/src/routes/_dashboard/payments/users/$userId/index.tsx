import { createFileRoute } from '@tanstack/react-router';
import { UserPaymentsPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/users/$userId/')({
  component: UserPaymentsPage,
});
