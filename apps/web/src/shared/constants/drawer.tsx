import {
  AlertTriangleIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClipboardCheck,
  CreditCardIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  Settings2Icon,
  ShieldIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react';

type DrawerItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: DrawerItem[];
};

export const DRAWER_NAV_MAIN: DrawerItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: <LayoutDashboardIcon />,
  },
  {
    title: 'Announcement',
    url: '/announcement',
    icon: <AlertTriangleIcon />,
    isActive: true,
    items: [
      {
        title: 'Published',
        url: '/announcement',
      },
      {
        title: 'Drafts',
        url: '/announcement/draft',
      },
      {
        title: 'Archive',
        url: '/announcement/archived',
      },
    ],
  },
  {
    title: 'Members',
    url: '/members',
    icon: <UsersIcon />,
    isActive: true,
    items: [
      {
        title: 'All Members',
        url: '/members',
      },
      {
        title: 'Membership Applicants',
        url: '/members/applications',
      },
      {
        title: 'Import Members',
        url: '/members/import',
      },
    ],
  },
  {
    title: 'Meetings',
    url: '/meetings',
    icon: <CalendarDaysIcon />,
    isActive: false,
    items: [
      {
        title: 'All Meetings',
        url: '/meetings',
      },
    ],
  },
  {
    title: 'Training',
    url: '/training',
    icon: <BookOpenIcon />,
    isActive: false,
    items: [
      {
        title: 'Modules',
        url: '/training',
      },
      {
        title: 'Completions',
        url: '/training/completions',
      },
    ],
  },
  {
    title: 'Plans',
    url: '/plans',
    icon: <CreditCardIcon />,
    isActive: false,
  },
  {
    title: 'Payments',
    url: '/payments',
    icon: <WalletIcon />,
    isActive: false,
    items: [
      {
        title: 'All Payments',
        url: '/payments',
      },
      {
        title: 'By Member',
        url: '/payments/users',
      },
      {
        title: 'Providers',
        url: '/payments/providers',
      },
      {
        title: 'History',
        url: '/payments/history',
      },
    ],
  },
  {
    title: 'Contributions',
    url: '/contributions',
    icon: <ClipboardCheck />,
    items: [
      {
        title: 'List',
        url: '/contributions',
      },
      {
        title: 'Record',
        url: '/contributions/record',
      },
      {
        title: 'Declarations',
        url: '/contributions/declarations',
      },
      {
        title: 'Retro Affected ',
        url: '/contributions/retroactive',
      },
    ],
  },
  {
    title: 'Ledger',
    url: '/ledger',
    icon: <BookOpenIcon />,
    isActive: false,
    items: [
      {
        title: 'Dashboard',
        url: '/ledger',
      },
      {
        title: 'Entries',
        url: '/ledger/entries',
      },
      {
        title: 'Accounts',
        url: '/ledger/accounts',
      },
      {
        title: 'Report',
        url: '/ledger/reports',
      },
    ],
  },
  {
    title: 'Audit Logs',
    url: '/audit-logs',
    icon: <ScrollTextIcon />,
    isActive: false,
  },
  {
    title: 'Privacy',
    url: '#',
    icon: <ShieldIcon />,
    isActive: false,
    items: [
      {
        title: 'Consent',
        url: '/consent',
      },
      {
        title: 'DSAR',
        url: '/dsar',
      },
    ],
  },
  {
    title: 'Compliance',
    url: '/compliance',
    icon: <ClipboardCheck />,
    isActive: false,
  },
  {
    title: 'Settings',
    url: '#',
    icon: <Settings2Icon />,
    items: [
      {
        title: 'Associations',
        url: '/associations/current',
      },
      {
        title: 'Member Types',
        url: '/member-types',
      },
      {
        title: 'General',
        url: '#',
      },
      {
        title: 'Change Password',
        url: '/change-password',
      },
    ],
  },
];
