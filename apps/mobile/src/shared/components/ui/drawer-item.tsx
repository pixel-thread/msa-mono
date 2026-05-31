import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './text';
import { cn } from '@lib/cn';
import { DrawerMenuItem } from '@src/shared/types/drawer';
import { Route, useRouter } from 'expo-router';

interface DrawerItemProps extends DrawerMenuItem {
  label: string;
  focused?: boolean;
}

export const DrawerItem = ({
  label,
  icon,
  focused,
  variant = 'default',
  href,
}: DrawerItemProps) => {
  const isDestructive = variant === 'destructive';
  const router = useRouter();

  const onPress = (href: Route) => {
    router.push(href);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(href)}
      activeOpacity={0.7}
      className={cn(
        'mx-2 mb-1 flex-row items-center px-6 py-3.5 transition-all',
        focused && 'bg-accent',
        !focused && 'hover:bg-accent/50'
      )}>
      <Ionicons
        name={icon}
        size={22}
        color={
          isDestructive
            ? 'hsl(355, 73%, 47%)'
            : focused
              ? 'hsl(221, 100%, 50%)'
              : 'hsl(214, 6%, 51%)'
        }
      />
      <Text
        className={cn(
          'ml-3 font-semibold',
          isDestructive ? 'text-destructive' : focused ? 'text-primary' : 'text-muted-foreground'
        )}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
