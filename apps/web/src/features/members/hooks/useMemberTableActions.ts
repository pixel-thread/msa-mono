import { useUpdateMemberAssociation } from './useUpdateMemberAssociation';
import { useUpdateMemberRole } from './useUpdateMemberRole';
import { useUpdateMemberStatus } from './useUpdateMemberStatus';

export function useMemberTableActions() {
  const updateStatus = useUpdateMemberStatus();
  const updateRole = useUpdateMemberRole();
  const updateAssociation = useUpdateMemberAssociation();

  return {
    onStatusChange: (memberId: string, status: string) => {
      updateStatus.mutate({ memberId, status });
    },
    onRoleChange: (memberId: string, role: string, action: 'add' | 'remove') => {
      updateRole.mutate({ memberId, role, action });
    },
    onAssociationChange: (memberId: string, associationId: string) => {
      updateAssociation.mutate({ memberId, associationId });
    },
    isPending: updateStatus.isPending || updateRole.isPending || updateAssociation.isPending,
  };
}
