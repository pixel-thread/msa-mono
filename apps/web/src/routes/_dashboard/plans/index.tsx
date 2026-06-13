import { PlansPage } from '@src/features/plans/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/plans/')({
  component: PlansPage,
});
