import { createFileRoute } from '@tanstack/react-router';
import PlansPage from '@src/features/subscriptions/pages/plans';

export const Route = createFileRoute('/_dashboard/subscriptions/')({
  component: PlansPage,
});
