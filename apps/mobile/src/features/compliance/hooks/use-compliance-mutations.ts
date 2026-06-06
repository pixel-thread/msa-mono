import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { complianceEndpoints } from '../utils/constants';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner-native';
import { Compliance, SubmitCompliancePayload } from '../types/compliance.types';
import { ComplianceSubmitFormData } from '../validators/compliance.validator';

export const useSubmitCompliance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ComplianceSubmitFormData) =>
      http.post<Compliance>(complianceEndpoints.submit, data as SubmitCompliancePayload),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLIANCE_KEYS.MY() });
        toast.success(data.message || 'Compliance submitted successfully');
        return data;
      }
      toast.error(data.message || 'Failed to submit compliance');
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit compliance');
    },
  });
};

export const useCancelCompliance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (complianceId: string) =>
      http.post<Compliance>(complianceEndpoints.cancel(complianceId)),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLIANCE_KEYS.MY() });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.COMPLIANCE_KEYS.MY_DETAIL() });
        toast.success(data.message || 'Compliance cancelled successfully');
        return data;
      }
      toast.error(data.message || 'Failed to cancel compliance');
      return data;
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to cancel compliance');
    },
  });
};
