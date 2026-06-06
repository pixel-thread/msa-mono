'use client';

import { Avatar, AvatarFallback } from '@src/shared/components/ui/avatar';
import { Link } from '@tanstack/react-router';
import { getInitials } from '@src/features/members/utils/helper/get-initials';
import type { User } from '@src/shared/types';

interface NameCellProps {
  member: User;
}

export function NameCell({ member }: NameCellProps) {
  return (
    <Link
      className="flex items-center gap-3 text-left hover:underline"
      to={`/members/${member.id}`}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs bg-muted">{getInitials(member.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{member.name}</span>
        {member.membershipNumber && (
          <span className="text-xs text-muted-foreground">{member.membershipNumber}</span>
        )}
      </div>
    </Link>
  );
}
