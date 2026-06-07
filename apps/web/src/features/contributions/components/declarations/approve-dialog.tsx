'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/components/ui/dialog';
import { Button } from '@src/shared/components/ui/button';
import { Label } from '@src/shared/components/ui/label';
import { Textarea } from '@src/shared/components/ui/textarea';
import { useApproveDeclaration } from '../../hooks/declarations/use-declaration-mutations';
import type { Declaration } from '../../types';

interface ApproveDialogProps {
  declaration: Declaration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveDialog({ declaration, open, onOpenChange }: ApproveDialogProps) {
  const [remark, setRemark] = useState('');
  const approveDeclaration = useApproveDeclaration();

  const handleApprove = () => {
    if (!declaration) return;
    approveDeclaration.mutate(
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
          <DialogTitle>Approve Declaration</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve the declaration from{' '}
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
          <Label htmlFor="approve-remark">Remark (Optional)</Label>
          <Textarea
            id="approve-remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Add a remark for this approval..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApprove} disabled={approveDeclaration.isPending}>
            {approveDeclaration.isPending ? 'Approving...' : 'Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
