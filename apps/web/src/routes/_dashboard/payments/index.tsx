import { AllPaymentsPage } from '@src/features/payments/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/payments/')({
  component: AllPaymentsPage,
});
