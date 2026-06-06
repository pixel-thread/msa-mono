import { createFileRoute } from '@tanstack/react-router';
import { PlansPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/plans/')({
  component: PlansPage,
});
