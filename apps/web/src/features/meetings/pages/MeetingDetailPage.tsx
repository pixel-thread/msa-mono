'use client';

import { useState } from 'react';
import { SectionHeader } from '@components/section-header';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Card, CardContent,CardHeader, CardTitle } from '@components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { Separator } from '@components/ui/separator';
import { CancelMeetingDialog } from '@feature/meetings/components/CancelMeetingDialog';
import { DeleteMeetingDialog } from '@feature/meetings/components/DeleteMeetingDialog';
import { EditMeetingDialog } from '@feature/meetings/components/EditMeetingDialog';
import { ManageAttendeesDialog } from '@feature/meetings/components/ManageAttendeesDialog';
import { useMeetingAttendees } from '@feature/meetings/hooks';
import {
  type AgendaItem,
  type Attendee,
  useMeetingDetail,
} from '@feature/meetings/hooks/useMeetingDetail';
import type { AssignAttendeeInput } from '@feature/meetings/validators';
import { useMembers } from '@feature/members/hooks/useMembers';
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';
import { formatDate } from '@utils/format';
import { getRsvpBadge,getStatusBadge, getTypeBadge } from '@utils/helper';
import {
  Calendar,
  CalendarX,
  ClipboardList,
  Clock,
  FileText,
  MapPin,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';

/**
 * Meeting Detail Page component.
 * Displays comprehensive information about a specific meeting, including agenda and attendees.
 */
export function MeetingDetailPage() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false }) as Record<string, string | undefined>;
  const meetingId = params.meetingId as string;
  const [editOpen, setEditOpen] = useState(searchParams.edit === 'true');
  const [manageAttendeesOpen, setManageAttendeesOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const { meeting, isLoading, error } = useMeetingDetail(meetingId);
  const { members } = useMembers();
  const { attendees, addAttendee, removeAttendee, isAdding, isRemoving } =
    useMeetingAttendees(meetingId);

  const handleAddAttendee = (data: AssignAttendeeInput) => {
    addAttendee({ meetingId, ...data });
  };

  const handleRemoveAttendee = (userId: string) => {
    removeAttendee({ meetingId, userId });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-body">Loading meeting details...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-lg text-body">Meeting not found</p>
        <Button
          variant="outline"
          className="mt-4 h-11 border-hairline bg-canvas px-5 text-sm font-medium text-ink hover:bg-surface-strong"
          onClick={() => window.history.back()}
        >
          Go back
        </Button>
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title={meeting.title}
        titleBadges={
          <>
            {getStatusBadge(meeting.status)}
            {getTypeBadge(meeting.type)}
          </>
        }
        description="Meeting details and agenda"
      >
        <Button
          variant="outline"
          className="h-11 border-hairline bg-canvas px-5 text-sm font-medium text-ink hover:bg-surface-strong"
          onClick={() => navigate({ to: '/meetings/$meetingId/assign', params: { meetingId } })}
        >
          <Users className="mr-2 h-4 w-4" />
          Manage Attendees
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-11 w-11">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                navigate({ to: '/meetings/$meetingId/minutes', params: { meetingId } })
              }
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Minutes
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCancelOpen(true)}>
              <CalendarX className="mr-2 h-4 w-4" />
              Cancel Meeting
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={() => setEditOpen(true)}
          className="h-11 bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-active"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Meeting
        </Button>
      </SectionHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className=" border-hairline bg-surface-card md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Meeting Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Scheduled</p>
                    <p className="text-sm text-ink">{formatDate(meeting.scheduledAt)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Venue</p>
                    <p className="text-sm text-ink">{meeting.venue || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Attendees</p>
                    <p className="text-sm text-ink">{meeting.attendees?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Organizer</p>
                    <p className="text-sm text-ink">{meeting.createdBy?.name || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {meeting.description && (
                <>
                  <Separator className="bg-hairline" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Description</p>
                    <p className="mt-1 text-sm text-ink">{meeting.description}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className=" border-hairline bg-surface-card">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Agenda Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {meeting.agendaItems && meeting.agendaItems.length > 0 ? (
              <div className="space-y-3">
                {meeting.agendaItems.map((item: AgendaItem, index: number) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{item.title}</p>
                      {item.duration && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {item.duration} min
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No agenda items</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className=" border-hairline bg-surface-card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Attendees
          </CardTitle>
        </CardHeader>
        <CardContent>
          {meeting.attendees && meeting.attendees.length > 0 ? (
            <div className="space-y-3">
              {meeting.attendees.map((attendee: Attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between border border-hairline p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{attendee.user.name}</p>
                    <p className="text-xs text-muted-foreground">{attendee.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {attendee.attendeeRole}
                    </Badge>
                    {getRsvpBadge(attendee.rsvpStatus)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No attendees assigned</p>
          )}
        </CardContent>
      </Card>

      <EditMeetingDialog
        meeting={meeting}
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            const url = new URL(window.location.href);
            url.searchParams.delete('edit');
            window.history.replaceState({}, '', url.toString());
          }
        }}
      />

      <ManageAttendeesDialog
        open={manageAttendeesOpen}
        onOpenChange={setManageAttendeesOpen}
        meeting={meeting}
        members={members || []}
        attendees={attendees || []}
        onAddAttendee={handleAddAttendee}
        onRemoveAttendee={handleRemoveAttendee}
        isAdding={isAdding}
        isRemoving={isRemoving}
      />

      <CancelMeetingDialog
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
      />

      <DeleteMeetingDialog
        meeting={meeting}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => navigate({ to: '/meetings' })}
      />
    </>
  );
}
