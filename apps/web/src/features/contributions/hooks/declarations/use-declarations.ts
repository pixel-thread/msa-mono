import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { ENDPOINTS } from '@repo/shared';
import { useAuthStore } from '@src/shared/stores';
import { Declaration } from '@src/features/contributions/types';

export function useDeclarations() {
  const { isSignedIn } = useAuthStore();
  const { isFetching, data, refetch } = useQuery({
    queryKey: ['declarations'],
    queryFn: () => http.get<Declaration[]>(ENDPOINTS.CONTRIBUTION.ALL_DECLARATIONS),
    enabled: isSignedIn,
  });

  const meta = data?.meta;
  const declarations = data?.data;

  return {
    isFetching,
    declarations,
    meta,
    refetch,
  };
}
