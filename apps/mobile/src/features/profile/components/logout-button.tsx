import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  AlertDialogTitle,
  Text,
  AlertDialogDescription,
} from '@components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@src/shared/store';
import { useState } from 'react';
import { View } from 'react-native';

export const LogoutButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { logout } = useAuthStore();

  const onConfirmLogout = async () => logout();

  const onPressLogout = () => setIsOpen(!isOpen);

  return (
    <>
      <Button variant="destructive" onPress={onPressLogout} className="h-14">
        <View className="flex-row items-center gap-x-2">
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text weight="bold" className="text-white">
            Logout
          </Text>
        </View>
      </Button>

      <AlertDialog open={isOpen} onOpenChange={onPressLogout}>
        <AlertDialogContent className="">
          <AlertDialogHeader>
            <AlertDialogTitle>Are your sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will completely log you out and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onPress={onPressLogout} />
            <AlertDialogAction variant="destructive" onPress={onConfirmLogout}>
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
