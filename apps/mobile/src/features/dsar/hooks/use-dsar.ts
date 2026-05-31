import { useQuery } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { dsarEndpoints, DSARQueryKeys } from '../utils/constants';
import { DSARRequest, DSARRequestDetail, SLAReport } from '../types/dsar.types';

/**
 * Hook to fetch the current user's DSAR requests.
 * 
 * @returns Query result containing the user's DSAR requests
 */
export const useMyDSARRequests = () => {
  return useQuery({
    queryKey: DSARQueryKeys.my(),
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
    queryKey: DSARQueryKeys.all(params),
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
    queryKey: DSARQueryKeys.detail(ticketId),
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
    queryKey: DSARQueryKeys.myDetail(ticketId),
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
    queryKey: DSARQueryKeys.slaReport(),
    queryFn: () => http.get<SLAReport>(dsarEndpoints.slaReport),
    select: (data) => data.data,
  });
};
