import PlansPage from '@src/features/subscriptions/pages/plans';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/subscriptions/')({
  component: PlansPage,
});
