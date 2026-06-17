import { DrawerMenuGroup, DrawerMenuItem } from '../types/drawer';

export const drawerMenuGroups: DrawerMenuGroup[] = [
  {
    title: 'Main Menu',
    items: [
      {
        label: 'Announcements',
        icon: 'megaphone-outline',
        href: '/(protected)/announcements',
      },
      {
        label: 'Meetings',
        icon: 'calendar-outline',
        href: '/(protected)/(drawer)/(tabs)/meetings',
      },
      {
        label: 'Training Completions',
        icon: 'checkmark-circle-outline',
        href: '/(protected)/training/completions',
      },
      {
        label: 'Consent',
        icon: 'document-lock-outline',
        href: '/(protected)/consent',
      },
      {
        label: 'Declarations',
        icon: 'document-text-outline',
        href: '/(protected)/declarations',
      },
      {
        label: 'Compliance',
        icon: 'warning-outline',
        href: '/(protected)/compliance',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        label: 'My Profile',
        icon: 'person-outline',
        href: '/(protected)/(drawer)/(tabs)/profile',
      },
      {
        label: 'Contribution',
        icon: 'card-outline',
        href: '/(protected)/contribution/my',
      },
      {
        label: 'Privacy Requests',
        icon: 'shield-outline',
        href: '/(protected)/profile/privacy/requests',
      },
    ],
  },
];

export const drawerFooterItems: DrawerMenuItem[] = [
  { label: 'About', icon: 'information-circle-outline', href: '/(protected)/legal/about' },
  { label: 'Terms & Conditions', icon: 'document-text-outline', href: '/(protected)/legal/terms' },
  {
    label: 'Privacy Policy',
    icon: 'shield-checkmark-outline',
    href: '/(protected)/legal/privacy-policy',
  },
];
