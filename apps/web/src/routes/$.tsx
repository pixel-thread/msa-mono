import { NotFoundPage } from '@feature/auth/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
});
