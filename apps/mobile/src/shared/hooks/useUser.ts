import { useQuery } from '@tanstack/react-query';
import http from '@utils/http';
import { useAuthStore } from '@src/shared/store';
import { IUser } from '@sharedTypes/user';

export function useUser() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['user'],
    queryFn: () => http.get<IUser>('/user'),
    select: (data) => data.data,
    enabled: isAuthenticated,
  });
}
