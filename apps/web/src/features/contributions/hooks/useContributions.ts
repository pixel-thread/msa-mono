import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ContributionPeriod } from '../types';
import { buildUrlWithQuery, ENDPOINTS } from '@repo/shared';

interface UseContributionsOptions {
  page?: number;
  status?: string;
  userId?: string;
  year?: number;
  month?: number;
}

export function useContributions(options: UseContributionsOptions = {}) {
  const { page = 1, status, userId, year, month } = options;
  const url = buildUrlWithQuery(ENDPOINTS.CONTRIBUTION.LIST, {
    page,
    status,
    userId,
    year,
    month,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['all-contributions', page, status, userId, year, month],
    queryFn: () => http.get<ContributionPeriod[]>(url),
  });

  return {
    contributions: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
