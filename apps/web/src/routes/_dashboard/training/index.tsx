import { TrainingListPage } from '@src/features/training/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/training/')({
  component: TrainingListPage,
});
