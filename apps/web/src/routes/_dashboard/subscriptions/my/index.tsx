import { createFileRoute } from '@tanstack/react-router';
import { MySubscriptionPage } from '@src/features/subscriptions/pages';

export const Route = createFileRoute('/_dashboard/subscriptions/my')({
  component: MySubscriptionPage,
});
