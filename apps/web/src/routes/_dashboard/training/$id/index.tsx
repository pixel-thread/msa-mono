import { createFileRoute } from '@tanstack/react-router';
import { TrainingDetailPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/$id/')({
  component: TrainingDetailPage,
});
