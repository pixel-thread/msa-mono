import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { ENDPOINTS, QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner-native';
import { DSARRequest, DSARResponsePayload } from '../types/dsar.types';
import { DSARSubmitFormData } from '../validators/dsar.validator';

/**
 * Hook to submit a new DSAR request.
 * 
 * @returns Mutation object for submitting a DSAR request
 */
export const useSubmitDSAR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DSARSubmitFormData) => 
      http.post<DSARRequest>(ENDPOINTS.DSAR.SUBMIT, data),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.MY() });
        toast.success(data.message || 'Request submitted successfully');
        return data;
      }
      toast.error(data.message || 'Failed to submit request');
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit request');
    },
  });
};

/**
 * Hook to respond to a DSAR request.
 * 
 * @returns Mutation object for responding to a DSAR request
 */
export const useRespondToDSAR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: DSARResponsePayload }) =>
      http.post<DSARRequest>(ENDPOINTS.DSAR.RESPOND(ticketId), payload),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.ALL() });
        toast.success(data.message || 'Response sent successfully');
        return data;
      }
      toast.error(data.message || 'Failed to send response');
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to send response');
    },
  });
};

/**
 * Hook to assign a DSAR request to a user.
 * 
 * @returns Mutation object for assigning a DSAR request
 */
export const useAssignDSAR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, assignedToId }: { ticketId: string; assignedToId: string }) =>
      http.patch<DSARRequest>(ENDPOINTS.DSAR.ASSIGN(ticketId), { assignedToId }),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.ALL() });
        toast.success(data.message || 'Ticket assigned successfully');
        return data;
      }
      toast.error(data.message || 'Failed to assign ticket');
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to assign ticket');
    },
  });
};

/**
 * Hook to cancel a pending DSAR request.
 * 
 * @returns Mutation object for cancelling a DSAR request
 */
export const useCancelDSAR = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) =>
      http.post<DSARRequest>(`/dsar/my/${ticketId}/cancel`),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.MY() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DSAR_KEYS.MY_DETAIL() });
        toast.success(data.message || 'Request cancelled successfully');
        return data;
      }
      toast.error(data.message || 'Failed to cancel request');
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel request');
    },
  });
};
