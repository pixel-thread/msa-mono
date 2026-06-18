import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import http from '@src/shared/utils/http';
import { useQuery } from '@tanstack/react-query';
import { ContributionOverview } from '../types';

export function useMyContributionOverView() {
  return useQuery({
    queryFn: () => http.get<ContributionOverview>(ENDPOINTS.CONTRIBUTION.MY_OVERVIEW),
    queryKey: QUERY_KEYS.CONTRIBUTIONS_KEYS.MY_OVERVIEW(),
    select: (data) => data.data,
  });
}
