import { PlanDetailPage } from '@src/features/subscriptions/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/subscriptions/plans/$planId/')({
  component: PlanDetailPage,
});
