import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@components/ui/alert-dialog';
import { Button } from '@components/ui/button';
import { useCancelMeeting } from '@feature/meetings/hooks/useCancelMeeting';
import { CalendarX } from 'lucide-react';

interface CancelMeetingCellProps {
  meetingId: string;
  meetingTitle: string;
  isDisabled?: boolean;
}

export const CancelMeetingCell = ({
  meetingId,
  meetingTitle,
  isDisabled,
}: CancelMeetingCellProps) => {
  const cancelMutation = useCancelMeeting();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button disabled={isDisabled} variant="destructive" size="xs">
          Cancel
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia>
            <CalendarX className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>Cancel Meeting</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel <strong>{meetingTitle}</strong>? This will notify all
            attendees.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => cancelMutation.mutate(meetingId)}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Meeting'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
