import { QUERY_KEYS } from '@repo/shared';
import { Association } from '@src/features/associations/types/association';
import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '../stores';
import http from '../utils/http';

export function useAssociation() {
  const { isSignedIn } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.CURRENT(),
    queryFn: () => http.get<Association>('/associations/current'),
    staleTime: 60_000,
    enabled: isSignedIn,
    select: (data) => data.data,
  });
}
