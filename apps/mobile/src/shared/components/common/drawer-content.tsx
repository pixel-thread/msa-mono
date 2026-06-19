import { useAuthStore } from '@src/features/auth';
import { useSegments } from 'expo-router';
import { Container } from './container';
import { ScrollView, TouchableOpacity, View, Image } from 'react-native';
import { Text } from '@components/ui';
import { DrawerItem } from '../ui/drawer-item';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Constants from 'expo-constants';
import { drawerFooterItems, drawerMenuGroups } from '@src/shared/constants/drawer';
import { cn } from '@src/shared/lib/cn';
import { Ionicons } from '@expo/vector-icons';
import { DrawerMenuGroup } from '@src/shared/types/drawer';
import { useAssociation } from '@src/shared/hooks/use-association';
import { Ternary } from '../ternary';

export const CustomDrawerContent = () => {
  const segments = useSegments();
  const { logout, isAuthLoading } = useAuthStore();
  const { data: association } = useAssociation();
  const inset = useSafeAreaInsets();

  const currentPath = segments.join('/');

  const menu: DrawerMenuGroup[] = drawerMenuGroups;
  const associationLogoUrl = association?.logo;
  const isLogoValidUrl = associationLogoUrl && associationLogoUrl.startsWith('http');

  return (
    <Container className="flex-1" style={{ paddingTop: inset.top }}>
      <View className="items-center gap-2 border-b border-slate-100 px-6 py-8 dark:border-slate-900">
        <Ternary
          condition={!!isLogoValidUrl}
          trueComponent={
            <Image source={{ uri: associationLogoUrl }} className="h-12 w-12" alt="App logo" />
          }
          falseComponent={
            <Image
              source={require('@assets/icons/splash-icon.png')}
              className="h-20 w-20"
              alt="App Logo"
            />
          }
        />
        <View>
          <Text
            size={'2xl'}
            variant={'subtext'}
            weight={'bold'}
            className="text-center uppercase tracking-widest">
            {association?.slug || Constants.default.expoConfig?.name}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 py-2" showsVerticalScrollIndicator>
        {menu.map((group, groupIndex) => (
          <View
            key={group.title}
            className={groupIndex < drawerMenuGroups.length - 1 ? 'mb-6' : ''}>
            <Text
              size={'sm'}
              weight={'bold'}
              variant={'subtext'}
              className="mb-1 px-6 py-2 uppercase tracking-widest">
              {group.title}
            </Text>
            {group.items.map((item) => (
              <DrawerItem
                key={item.label}
                label={item.label}
                icon={item.icon}
                focused={currentPath.includes(item.label.toLowerCase())}
                href={item.href}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View
        className="border-t border-slate-100 pt-4 dark:border-slate-900"
        style={{ paddingBottom: inset.bottom }}>
        {drawerFooterItems.map((item) => (
          <DrawerItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            href={item.href}
            variant={item.variant}
          />
        ))}

        <TouchableOpacity
          onPress={logout}
          activeOpacity={0.7}
          disabled={isAuthLoading}
          className={cn('mx-2 mb-1 flex-row items-center px-6 py-3.5 transition-all')}>
          <Ionicons name={'log-out-outline'} size={22} color={'#ef4444'} />
          <Text className={cn('ml-3 font-semibold', 'text-red-500')}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};
