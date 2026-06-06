import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ContributionPeriod, ContributionSummary } from '../types';
import { buildUrlWithQuery, ENDPOINTS, QUERY_KEYS } from '@repo/shared';

interface UseUserContributionsOptions {
  userId: string;
  fromYear?: number;
  fromMonth?: number;
  toYear?: number;
  toMonth?: number;
  page?: number;
}

export function useUserContributions(options: UseUserContributionsOptions) {
  const { userId, fromYear, fromMonth, toYear, toMonth, page } = options;

  const url = ENDPOINTS.CONTRIBUTION.USER(userId);

  const safeUrl = buildUrlWithQuery(url, {
    fromYear,
    fromMonth,
    toYear,
    toMonth,
    page,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.USER(userId, fromYear, fromMonth, toYear, toMonth, page),
    queryFn: () =>
      http.get<{
        contributions: ContributionPeriod[];
        user: {
          id: string;
          name: string;
          email: string;
          membershipNumber: string | null;
        } | null;
        summary: ContributionSummary;
      }>(safeUrl),
    enabled: !!userId,
  });

  const meta = data?.meta;

  return {
    meta: meta,
    contributions: data?.data?.contributions ?? [],
    user: data?.data?.user ?? null,
    summary: data?.data?.summary ?? null,
    isLoading,
    error,
    refetch,
  };
}
