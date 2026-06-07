import { TrainingCompletionsPage } from '@src/features/training/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/training/$id/completions/')({
  component: TrainingCompletionsPage,
});
