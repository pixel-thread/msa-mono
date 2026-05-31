import { IconWithBadge } from '@src/shared/components/common';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export const DashboardRightActions = () => {
  const router = useRouter();
  return (
    <View className="flex-row px-2">
      <IconWithBadge
        name="megaphone-outline"
        onPress={() => router.push('/(protected)/announcements')}
        showBadge={false}
      />
    </View>
  );
};
