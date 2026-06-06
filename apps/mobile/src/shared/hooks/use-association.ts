import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { sharedEnpoint } from '@constants/endpoints';
import { useAuthStore } from '../store';
import { AssociationT } from '../types/association';
import { QUERY_KEYS } from '@repo/shared';

export function useAssociation() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.ASSOCIATIONS_KEYS.CURRENT(),
    queryFn: () => http.get<AssociationT>(sharedEnpoint.associations.getCurrentAssociation),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
}
