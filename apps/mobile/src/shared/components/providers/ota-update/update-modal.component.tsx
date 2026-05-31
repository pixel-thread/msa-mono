import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@src/shared/components/ui/alert-dialog';
import { useOtaUpdateStore } from '@src/shared/store';
import { useOtaUpdateCheck } from '@src/shared/hooks/use-ota-update-check';

export const OtaUpdateModal = () => {
  const { isUpdateAvailable, isDownloading, isReady, dismissed } = useOtaUpdateStore();
  const { downloadUpdate, applyUpdate } = useOtaUpdateCheck();
  const { dismiss } = useOtaUpdateStore();

  const isVisible = (isUpdateAvailable || isDownloading || isReady) && !dismissed;

  const handleClose = () => {
    dismiss();
  };

  const handleDownload = () => {
    downloadUpdate();
  };

  const handleApply = () => {
    applyUpdate();
  };

  if (isDownloading) {
    return (
      <AlertDialog open={isVisible} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <ActivityIndicator size="large" color="#6366f1" />
            <AlertDialogTitle>Downloading Update</AlertDialogTitle>
            <AlertDialogDescription>
              Please wait while we download the latest version...
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (isReady) {
    return (
      <AlertDialog open={isVisible} onOpenChange={handleClose}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <AlertDialogTitle>Update Ready</AlertDialogTitle>
            <AlertDialogDescription>
              The update has been downloaded. Restart the app to apply the changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onPress={handleApply}>Restart Now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={isVisible} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Available</AlertDialogTitle>
          <AlertDialogDescription>
            A new version of the app is available. Update now to get the latest features and improvements.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onPress={handleClose}>Later</AlertDialogCancel>
          <AlertDialogAction onPress={handleDownload}>Update Now</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
