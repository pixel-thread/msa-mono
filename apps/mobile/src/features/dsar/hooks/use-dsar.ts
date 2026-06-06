import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { DSARRequest, DSARRequestDetail, SLAReport } from '../types/dsar.types';

/**
 * Hook to fetch the current user's DSAR requests.
 * 
 * @returns Query result containing the user's DSAR requests
 */
export const useMyDSARRequests = () => {
  return useQuery({
    queryKey: QUERY_KEYS.DSAR_KEYS.MY(),
    queryFn: () => http.get<DSARRequest[]>(ENDPOINTS.DSAR.MY_LIST),
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
    queryFn: () => http.get<DSARRequest[]>(ENDPOINTS.DSAR.LIST, { params }),
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
    queryFn: () => http.get<DSARRequest>(ENDPOINTS.DSAR.DETAIL(ticketId)),
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
    queryFn: () => http.get<DSARRequestDetail>(ENDPOINTS.DSAR.MY_DETAIL(ticketId)),
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
    queryFn: () => http.get<SLAReport>(ENDPOINTS.DSAR.SLA_REPORT),
    select: (data) => data.data,
  });
};
