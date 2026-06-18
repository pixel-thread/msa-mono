import { UserRole } from '@src/shared/types/role';
import { AssociationT } from '@src/shared/types/association';

export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface Association extends AssociationT {
  slug: string;
}

export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole[];
}

export interface AnnouncementRead {
  id: string;
  announcementId: string;
  userId: string;
  readAt: string | Date;
}

export interface Announcement {
  id: string;
  associationId: string;
  authorId: string;
  title: string;
  summary: string | null;
  content: string;
  imageUrl: string | null;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  targetRoles: UserRole[];
  isPinned: boolean;
  publishedAt: string | Date | null;
  expiresAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  association: Association;
  author: User;
  readReceipts: AnnouncementRead[];
}
