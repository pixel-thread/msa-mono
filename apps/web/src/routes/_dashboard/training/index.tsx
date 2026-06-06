import { createFileRoute } from '@tanstack/react-router';
import { TrainingListPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/')({
  component: TrainingListPage,
});
