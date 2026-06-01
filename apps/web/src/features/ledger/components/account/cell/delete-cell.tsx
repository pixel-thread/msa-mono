import { useDeleteLedgerAccount } from '@src/features/ledger/hooks/use-delete-ledger-account';
import {
  AlertDialogHeader,
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@src/shared/components/ui/alert-dialog';

import { Button } from '@src/shared/components/ui/button';
import { TrashIcon } from 'lucide-react';
export const DeleteAccountCell = ({ id }: { id: string }) => {
  const { mutate, isPending: isDeleting } = useDeleteLedgerAccount();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant={'destructive'}>
          <TrashIcon className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this account?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={isDeleting} onClick={() => mutate(id)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
