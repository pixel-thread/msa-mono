'use client';

import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';

import { ContributionPeriod } from '../types';

export function useContributionDetail(contributionId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.DETAIL(contributionId),
    queryFn: () =>
      http.get<ContributionPeriod>(ENDPOINTS.CONTRIBUTION.DETAIL(contributionId || '')),
    enabled: !!contributionId,
  });

  return {
    contribution: data?.data ?? null,
    isLoading,
    error,
    refetch,
  };
}
