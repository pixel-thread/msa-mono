import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { UserContributionData } from '../types';
import { paymentEndpoints } from '../utils/constants/endpoints';
import { buildUrlWithQuery } from '@repo/shared';

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

  const url = `${paymentEndpoints.userContributions(userId)}`;

  const safeUrl = buildUrlWithQuery(url, {
    fromYear,
    fromMonth,
    toYear,
    toMonth,
    page,
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-contributions', userId, fromYear, fromMonth, toYear, toMonth, page],
    queryFn: () => http.get<UserContributionData>(safeUrl),
    enabled: !!userId,
  });

  const meta = data?.meta;

  return {
    user: data?.data?.user ?? null,
    meta: meta,
    contributions: data?.data?.contributions ?? [],
    summary: data?.data?.summary ?? null,
    isLoading,
    error,
    refetch,
  };
}
