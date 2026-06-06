import { createFileRoute } from '@tanstack/react-router';
import { TrainingAssignPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/$id/assign')({
  component: TrainingAssignPage,
});
