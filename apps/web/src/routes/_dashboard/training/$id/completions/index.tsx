import { createFileRoute } from '@tanstack/react-router';
import { TrainingCompletionsPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/$id/completions/')({
  component: TrainingCompletionsPage,
});
