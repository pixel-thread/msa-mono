import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@src/shared/utils';
import { Link } from '@tanstack/react-router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@src/shared/components/ui/dropdown-menu';
import { Button } from '@src/shared/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { useMeetings } from '@feature/meetings/hooks';
import type { Meeting } from '@feature/meetings/types';
import { getTypeBadge } from '@utils/helper/get-type-badge';
import { getStatusBadge } from '@utils/helper/get-status-badge';
import { CancelMeetingCell } from '@feature/meetings/components/cells/cancel-meeting';

export const useMeetingTableColumns = (): {
  columns: ColumnDef<Meeting>[];
  deleteMeeting: (id: string) => void;
  isDeleting: boolean;
} => {
  const { deleteMeeting, isDeleting } = useMeetings();

  const columns: ColumnDef<Meeting>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => {
        const meeting = row.original;
        return (
          <Link
            className="text-sm font-medium text-ink hover:underline"
            to={`/meetings/${meeting.id}`}
          >
            {meeting.title}
          </Link>
        );
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => getTypeBadge(row.original.type),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Scheduled',
      cell: ({ row }) => (
        <span className="text-sm text-body">{formatDate(row.original.scheduledAt)}</span>
      ),
    },
    {
      accessorKey: 'venue',
      header: 'Venue',
      cell: ({ row }) => (
        <span className="text-sm text-body">{row.original.venue || 'Not set'}</span>
      ),
    },
    {
      accessorKey: '_count',
      header: 'Attendees',
      cell: ({ row }) => (
        <span className="text-sm text-body">{row.original._count?.attendees || 0}</span>
      ),
    },
    {
      header: 'Cancel',
      cell: ({ row }) => (
        <CancelMeetingCell
          isDisabled={row.original.status !== 'SCHEDULED'}
          meetingId={row.original.id}
          meetingTitle={row.original.title}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const meeting = row.original;
        const meetingId = row.original.id || '';

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/meetings/${meeting.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={`/meetings/${meetingId}`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this meeting?')) {
                    deleteMeeting(meeting.id);
                  }
                }}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this meeting?')) {
                    deleteMeeting(meeting.id);
                  }
                }}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return { columns, deleteMeeting, isDeleting };
};
