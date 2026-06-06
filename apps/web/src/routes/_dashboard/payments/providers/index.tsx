import { createFileRoute } from '@tanstack/react-router';
import { PaymentProvidersPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/providers/')({
  component: PaymentProvidersPage,
});
