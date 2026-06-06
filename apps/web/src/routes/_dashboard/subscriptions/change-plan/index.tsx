import { createFileRoute } from '@tanstack/react-router';
import { ChangePlanPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/change-plan/')({
  component: ChangePlanPage,
});
