import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { dsarEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { DSARRequest, DSARRequestDetail, SLAReport } from '../types/dsar.types';

/**
 * Hook to fetch the current user's DSAR requests.
 * 
 * @returns Query result containing the user's DSAR requests
 */
export const useMyDSARRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DSAR_KEYS.MY(),
    queryFn: () => http.get<DSARRequest[]>(dsarEndpoints.my),
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch all DSAR requests with optional filters.
 * 
 * @param params - Optional query parameters for filtering
 * @returns Query result containing all DSAR requests
 */
export const useAllDSARRequests = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: QUERY_KEYS.DSAR_KEYS.TICKETS(params),
    queryFn: () => http.get<DSARRequest[]>(dsarEndpoints.list, { params }),
    select: (data) => data.data,
  });
};

/**
 * Hook to fetch the details of a specific DSAR request.
 * 
 * @param ticketId - The unique identifier of the DSAR request
 * @returns Query result containing the DSAR request detail
 */
export const useDSARDetail = (ticketId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.DSAR_KEYS.DETAIL(ticketId),
    queryFn: () => http.get<DSARRequest>(dsarEndpoints.detail(ticketId)),
    select: (data) => data.data,
    enabled: !!ticketId,
  });
};

/**
 * Hook to fetch the details of the current user's specific DSAR request.
 * 
 * @param ticketId - The unique identifier of the DSAR request
 * @returns Query result containing the DSAR request detail with responses
 */
export const useMyDSARDetail = (ticketId: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.DSAR_KEYS.MY_DETAIL(ticketId),
    queryFn: () => http.get<DSARRequestDetail>(dsarEndpoints.myDetail(ticketId)),
    select: (data) => data.data,
    enabled: !!ticketId,
  });
};

/**
 * Hook to fetch the DSAR SLA report.
 * 
 * @returns Query result containing the SLA report data
 */
export const useSlaReport = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DSAR_KEYS.SLA_REPORT(),
    queryFn: () => http.get<SLAReport>(dsarEndpoints.slaReport),
    select: (data) => data.data,
  });
};
