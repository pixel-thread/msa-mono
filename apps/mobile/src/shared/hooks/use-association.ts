import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { useAuthStore } from '../store';
import { AssociationT } from '../types/association';
import { QUERY_KEYS, ENDPOINTS } from '@repo/shared';

export function useAssociation() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.CURRENT(),
    queryFn: () => http.get<AssociationT>(ENDPOINTS.ASSOCIATIONS.CURRENT),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
}
