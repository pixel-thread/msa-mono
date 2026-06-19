import { Ionicons } from '@expo/vector-icons';
import { Route } from 'expo-router';

type QuickAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: Route;
};

export const DASHBOARD_QUICK_ACTIONS: QuickAction[] = [
  {
    icon: 'calendar-outline' as const,
    label: 'Schedule',
    route: '/(protected)/(drawer)/(tabs)/meetings' as const,
  },
  {
    icon: 'document-text-outline' as const,
    label: 'Contribution',
    route: '/(protected)/contribution/my',
  },
  { icon: 'school-outline' as const, label: 'Training', route: '/(protected)/training' as const },
];
