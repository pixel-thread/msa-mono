import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache(),
  queryCache: new QueryCache(),
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      retry: 3,
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 1,
    },
  },
});
