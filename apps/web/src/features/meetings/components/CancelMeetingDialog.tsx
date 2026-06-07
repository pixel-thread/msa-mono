'use client';

import { Button } from '@src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/components/ui/dialog';
import { CalendarX } from 'lucide-react';

import { useCancelMeeting } from '../hooks/useCancelMeeting';

interface CancelMeetingDialogProps {
  meetingId: string;
  meetingTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CancelMeetingDialog({
  meetingId,
  meetingTitle,
  open,
  onOpenChange,
}: CancelMeetingDialogProps) {
  const cancelMutation = useCancelMeeting();

  const handleCancel = () => {
    cancelMutation.mutate(meetingId, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-red-100">
              <CalendarX className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Cancel Meeting</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Are you sure you want to cancel <strong>{meetingTitle}</strong>? This will notify all
            attendees and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={cancelMutation.isPending}
          >
            Keep Meeting
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Meeting'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
