import { ChangePlanPage } from '@src/features/subscriptions/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/subscriptions/change-plan/')({
  component: ChangePlanPage,
});
