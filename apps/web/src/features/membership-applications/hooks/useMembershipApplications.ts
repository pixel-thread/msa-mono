import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, buildUrlWithQuery, QUERY_KEYS } from '@repo/shared';
import { MembershipApplicationListItem } from '../types';

interface ApplicationsResponse {
  data: MembershipApplicationListItem[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface UseMembershipApplicationsOptions {
  page?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export function useMembershipApplications(options: UseMembershipApplicationsOptions = {}) {
  const { page = 1, status } = options;
  const url = buildUrlWithQuery(ENDPOINTS.ADMIN.MEMBERSHIP_APPLICATIONS, { page, ...(status && { status }) });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.MEMBERSHIP_APPLICATIONS_KEYS.LIST(page, status),
    queryFn: () => http.get<MembershipApplicationListItem[]>(url),
    refetchOnMount: true,
    networkMode: 'offlineFirst',
  });

  const result = data?.data;

  return {
    applications: result ?? [],
    pagination: data?.meta ?? null,
    isLoading,
    error,
    refetch,
  };
}
