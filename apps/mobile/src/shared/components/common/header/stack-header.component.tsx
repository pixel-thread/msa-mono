import React from 'react';
import { router, Stack, useNavigation } from 'expo-router';
import { Appearance, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { logger } from '@src/shared/utils/logger';

export interface StackHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightAction?: React.ReactNode;
  showDrawerButton?: boolean;
}

/**
 * Custom Drawer toggle button that targets the parent navigator explicitly.
 * This avoids the "Is your screen inside a Drawer navigator?" warning.
 */
const CustomDrawerToggleButton = ({ tintColor }: { tintColor?: string }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="ml-2 p-2"
      accessibilityRole="button"
      accessibilityLabel="Open drawer">
      <Ionicons name="menu" size={24} color={tintColor || '#64748b'} />
    </TouchableOpacity>
  );
};

type HeaderLeftProps = {
  showDrawerButton: boolean;
  hasDrawer: boolean;
  showBackButton: boolean;
  ableToGoBack: boolean;
  headerTintColor: string;
};

const HeaderLeft = ({
  showDrawerButton,
  hasDrawer,
  showBackButton,
  ableToGoBack,
  headerTintColor,
}: HeaderLeftProps) => {
  if (showDrawerButton && hasDrawer) {
    return <CustomDrawerToggleButton tintColor={headerTintColor} />;
  }

  if (showBackButton && ableToGoBack) {
    return (
      <TouchableOpacity
        onPress={() => router.back()} // router.back() is more robust across groups
        className="p-2 pr-5"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons
          name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
          size={24}
          color={headerTintColor}
        />
      </TouchableOpacity>
    );
  }

  return null;
};
/**
 * StackHeader: A wrapper for Expo Router's Screen options.
 * Targets the immediate navigator (Stack, Tabs, or Drawer) to avoid context issues.
 * Follows the proper pattern for defining headers in nested layouts.
 */
export const StackHeader = ({
  title,
  rightAction,
  showBackButton = false,
  showDrawerButton = false,
}: StackHeaderProps) => {
  const isDark = Appearance.getColorScheme() === 'dark';
  const navigation = useNavigation();

  // Check if we are nested within a Drawer navigator
  const hasDrawer = React.useMemo(() => {
    let current = navigation;
    while (current) {
      if (current.getState()?.type === 'drawer') return true;
      try {
        current = current.getParent();
      } catch (e) {
        logger.error('Could not get parent navigator', { error: e });
        break;
      }
    }
    return false;
  }, [navigation]);

  const ableToGoBack = navigation.canGoBack();

  const headerTintColor = isDark ? '#f8fafc' : '#0f172a';

  return (
    <Stack.Screen
      options={{
        headerTitle: title,
        headerBackButtonMenuEnabled: true,
        headerShown: true,
        headerShadowVisible: false,
        headerBackVisible: false,
        headerStyle: {
          backgroundColor: isDark ? '#020617' : '#f8fafc',
        },
        contentStyle: {
          borderBlockColor: '#000',
          borderBottomWidth: 2,
          shadowColor: '#000',
          shadowOffset: { width: 1, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          fontFamily: 'JetBrainsMono_700Bold',
          color: headerTintColor,
        },
        headerTintColor: headerTintColor,
        headerRight: rightAction ? () => rightAction : undefined,
        headerLeft: () => (
          <HeaderLeft
            hasDrawer={hasDrawer}
            showBackButton={showBackButton}
            ableToGoBack={ableToGoBack}
            headerTintColor={headerTintColor}
            showDrawerButton={showDrawerButton}
          />
        ),
      }}
    />
  );
};
