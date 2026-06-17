'use client';

import { useState } from 'react';
import { QUERY_KEYS } from '@repo/shared';
import { ProviderDetail } from '@src/features/payments/components/provider-detail';
import {
  useDeleteProvider,
  useProviderDetail,
} from '@src/features/payments/hooks/use-payment-providers';
import { Button } from '@src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@src/shared/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ProviderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  onEdit: (providerId: string) => void;
}

export function ProviderDetailDialog({
  open,
  onOpenChange,
  providerId,
  onEdit,
}: ProviderDetailDialogProps) {
  const queryClient = useQueryClient();
  const { provider, isLoading } = useProviderDetail(providerId);
  const deleteProvider = useDeleteProvider();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    deleteProvider.mutate(providerId, {
      onSuccess: (response) => {
        if (response.success) {
          toast.success(response.message || 'Provider deleted successfully');
        } else {
          toast.error(response.message || 'Failed to delete provider');
        }
        setDeleteDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS_KEYS.PROVIDERS() });
        onOpenChange(false);
      },
      onError: () => {
        toast.error('Failed to delete provider');
        setDeleteDialogOpen(false);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{provider?.provider ?? 'Provider Details'}</DialogTitle>
            <DialogDescription>Payment provider configuration</DialogDescription>
          </DialogHeader>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-body">Loading provider details...</p>
            </div>
          ) : !provider ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-lg text-body">Provider not found</p>
            </div>
          ) : (
            <ProviderDetail
              provider={provider}
              onEdit={() => {
                onOpenChange(false);
                onEdit(providerId);
              }}
              onDelete={() => setDeleteDialogOpen(true)}
              isDeleting={deleteProvider.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment provider? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteProvider.isPending}
            >
              {deleteProvider.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
