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
import { Label } from '@src/shared/components/ui/label';
import { Textarea } from '@src/shared/components/ui/textarea';

import { useRejectDeclaration } from '../../hooks/declarations/use-declaration-mutations';
import type { Declaration } from '../../types';

interface RejectDialogProps {
  declaration: Declaration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectDialog({ declaration, open, onOpenChange }: RejectDialogProps) {
  const [remark, setRemark] = useState('');
  const rejectDeclaration = useRejectDeclaration();

  const handleReject = () => {
    if (!declaration) return;
    rejectDeclaration.mutate(
      { id: declaration.id, remark: remark.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setRemark('');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Reject Declaration</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject the declaration from{' '}
            <span className="font-medium">{declaration?.member.name}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="border border-hairline bg-surface-soft p-4 rounded-md space-y-2">
          <p className="text-sm text-ink">
            <span className="font-medium">Amount:</span> {declaration?.amount}
          </p>
          <p className="text-sm text-ink">
            <span className="font-medium">Period:</span>{' '}
            {declaration?.declerationStartDate
              ? new Date(declaration.declerationStartDate).toLocaleDateString()
              : '-'}{' '}
            to{' '}
            {declaration?.declerationEndDate
              ? new Date(declaration.declerationEndDate).toLocaleDateString()
              : '-'}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reject-remark">Remark</Label>
          <Textarea
            id="reject-remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Provide a reason for rejection..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={rejectDeclaration.isPending}
          >
            {rejectDeclaration.isPending ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
