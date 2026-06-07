import { UserPaymentsPage } from '@src/features/payments/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/payments/users/$userId/')({
  component: UserPaymentsPage,
});
