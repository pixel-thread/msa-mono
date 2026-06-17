'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@src/shared/components/ui/select';
import type { User } from '@src/shared/types';

import { useChangeMemberType } from '../../hooks/use-change-member-type';
import { useMemberTypes } from '../../hooks/use-member-types';

interface TypeCellProps {
  member: User;
}

export function MemberTypeCell({ member }: TypeCellProps) {
  const { memberTypes, isLoading } = useMemberTypes();
  const { mutate, isPending } = useChangeMemberType();
  return (
    <Select
      value={member.memberTypeId || ''}
      onValueChange={(newStatus) => {
        mutate({
          memberId: member.id,
          memberTypeId: newStatus,
        });
      }}
    >
      <SelectTrigger disabled={isLoading || isPending} className="h-8 w-35 border-hairline">
        <SelectValue placeholder="Member Type" />
      </SelectTrigger>
      <SelectContent>
        {memberTypes.map((type) => (
          <SelectItem key={type.id} value={type.id}>
            {type.level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
