import '@fontsource/roboto';
import '@fontsource/roboto-mono';
import '@fontsource/jetbrains-mono';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { AppProviders } from '@src/shared/providers/AppProviders';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { env } from '@src/env';
import { Suspense } from 'react';

export const Route = createRootRoute({
  component: () => (
    <Suspense fallback={null}>
      <AppProviders>
        <Outlet />
        {env.NEXT_PUBLIC_NODE_ENV === 'development' && (
          <Suspense fallback={null}>
            <ReactQueryDevtools />
          </Suspense>
        )}
      </AppProviders>
    </Suspense>
  ),
});
