import type { AnyRouter } from '@tanstack/react-router';

let routerInstance: AnyRouter | null = null;

export function setRouter(router: AnyRouter) {
  routerInstance = router;
}

export function navigate(to: string) {
  routerInstance?.navigate({ to, replace: true });
}
