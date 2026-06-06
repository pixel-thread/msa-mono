import { useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@src/shared/utils/http';
import { QUERY_KEYS } from '@repo/shared';
import { toast } from 'sonner';
import { membersEndpoints } from '../utils/constants/endpoints';

interface ApproveMemberData {
  applicationId: string;
  memberTypeId: string;
  role?: string;
  dateOfJoiningGovt?: Date;
}

export function useApproveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ApproveMemberData) =>
      http.post(membersEndpoints.applications.approve(data.applicationId), {
        memberTypeId: data.memberTypeId,
        role: data.role,
        dateOfJoiningGovt: data.dateOfJoiningGovt,
      }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MEMBERS_KEYS.ALL() });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.MEMBERSHIP_APPLICATIONS_KEYS.ALL(),
        });
        return;
      }
      toast.error(data.message);
    },
  });
}
