import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { useAuthStore } from '@src/shared/store';
import { IUser } from '@sharedTypes/user';
import { QUERY_KEYS } from '@repo/shared';

export function useUser() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: QUERY_KEYS.USER_KEYS.USER(),
    queryFn: () => http.get<IUser>('/user'),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
}
