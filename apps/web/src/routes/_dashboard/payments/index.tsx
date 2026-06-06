import { createFileRoute } from '@tanstack/react-router';
import { AllPaymentsPage } from '@src/features/payments/pages';

export const Route = createFileRoute('/_dashboard/payments/')({
  component: AllPaymentsPage,
});
