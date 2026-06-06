import { createFileRoute } from '@tanstack/react-router';
import { PaymentDetailPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/$paymentId')({
  component: PaymentDetailPage,
});
