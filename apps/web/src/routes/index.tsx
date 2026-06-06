import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@src/shared/pages/home-page';

export const Route = createFileRoute('/')({
  component: HomePage,
});
