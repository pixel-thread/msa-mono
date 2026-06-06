import { createFileRoute } from '@tanstack/react-router';
import { PlanDetailPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/plans/$planId/')({
  component: PlanDetailPage,
});
