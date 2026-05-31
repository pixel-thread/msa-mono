import { Ionicons } from '@expo/vector-icons';
import { Route } from 'expo-router';

export type DrawerMenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: Route;
  variant?: 'default' | 'destructive';
};

export type DrawerMenuGroup = {
  title: string;
  items: DrawerMenuItem[];
};
