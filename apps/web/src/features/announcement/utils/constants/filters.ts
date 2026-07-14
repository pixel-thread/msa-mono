import { FilterField } from '@src/shared/components/data-table-filters';

export const announcementListFilters: FilterField[] = [
  {
    type: 'search',
    id: 'search',
    placeholder: 'Search announcements...',
  },
  {
    type: 'select',
    id: 'status',
    label: 'Status',
    options: [
      { label: 'Published', value: 'PUBLISHED' },
      { label: 'Draft', value: 'DRAFT' },
      { label: 'Archived', value: 'ARCHIVED' },
      { label: 'Scheduled', value: 'SCHEDULED' },
    ],
  },
  {
    type: 'select',
    id: 'priority',
    label: 'Priority',
    options: [
      { label: 'Low', value: 'LOW' },
      { label: 'Normal', value: 'NORMAL' },
      { label: 'High', value: 'HIGH' },
      { label: 'Urgent', value: 'URGENT' },
    ],
  },
];
