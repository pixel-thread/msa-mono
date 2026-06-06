import { createFileRoute } from '@tanstack/react-router';
import { TrainingAllCompletionsPage } from '@src/features/training/pages';

export const Route = createFileRoute('/_dashboard/training/completions')({
  component: TrainingAllCompletionsPage,
});
