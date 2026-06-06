import { createFileRoute } from '@tanstack/react-router';
import { SubscriptionsPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/')({
  component: SubscriptionsPage,
});
