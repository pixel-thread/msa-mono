'use client';

import { useState } from 'react';
import { Button } from '@src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/components/ui/dialog';
import { Input } from '@src/shared/components/ui/input';
import { Label } from '@src/shared/components/ui/label';

import { useRejectEntry } from '../hooks/use-reject-entry';

interface RejectEntryDialogProps {
  entryId: string | null;
  entryDescription: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectEntryDialog({
  entryId,
  entryDescription,
  open,
  onOpenChange,
}: RejectEntryDialogProps) {
  const [reason, setReason] = useState('');
  const { mutate: rejectEntry, isPending } = useRejectEntry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryId) return;
    rejectEntry(
      { id: entryId, reason },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Ledger Entry</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject "{entryDescription}"?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (Optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Incorrect allocation"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              Reject Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
