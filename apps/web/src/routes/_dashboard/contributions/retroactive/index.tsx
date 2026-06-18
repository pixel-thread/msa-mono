import { RetroactivePage } from '@src/features/contributions/pages';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/contributions/retroactive/')({
  component: RetroactivePage,
});
