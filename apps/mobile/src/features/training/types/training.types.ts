import type { UserRole, UserStatus } from '@src/shared/types/role';

export type TrainingAssignmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';

type SupplementType = 'VIDEO' | 'IMAGE' | 'PDF';

export interface TrainingSupplement {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  type: SupplementType;
  fileUrl: 'https://picsum.photos/200/300';
  thumbnailUrl: string | null;
  mimeType: string;
  fileSize: number;
  durationSeconds: number | null;
  sortOrder: number;
  isActive: boolean;
}

export interface TrainingModule {
  id: string;
  associationId: string;
  title: string;
  description: string | null;
  content: string;
  durationMinutes: number | null;
  requiredForRoles: UserRole[];
  version: number;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  supplements: TrainingSupplement[];
}

export interface TrainingCompletion {
  id: string;
  userId: string;
  moduleId: string;
  scorePercent: number | null;
  certificateUrl: string | null;
  completedAt: string | Date;
}

export interface TrainingCompletionWithUser extends TrainingCompletion {
  user: {
    id: string;
    name: string;
    email: string;
  };
  module: {
    id: string;
    title: string;
  };
}

export interface TrainingCompletionWithModule extends TrainingCompletion {
  module: TrainingModule;
}

export interface CreateTrainingModuleInput {
  title: string;
  description?: string | null;
  content: string;
  durationMinutes?: number | null;
  requiredForRoles: UserRole[];
  isActive?: boolean;
}

export interface UpdateTrainingModuleInput {
  title?: string;
  description?: string | null;
  content?: string;
  durationMinutes?: number | null;
  requiredForRoles?: UserRole[];
  isActive?: boolean;
}

export interface CompleteTrainingInput {
  userId?: string;
}

export interface TrainingAssignment {
  id: string;
  moduleId: string;
  userId: string;
  status: TrainingAssignmentStatus;
  assignedAt: string | Date;
  dueDate: string | Date | null;
  startedAt: string | Date | null;
  completedAt: string | Date | null;
  reminderSentAt: string | Date | null;
  assignedById: string | null;
  notes: string | null;
}

export interface TrainingAssignmentWithUser extends TrainingAssignment {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole[];
    status: UserStatus;
  };
}

export interface AssignTrainingInput {
  userId: string;
}

export interface BulkAssignTrainingResponse {
  created: { moduleId: string; userId: string }[];
  skipped: string[];
}

export interface BulkRemoveAssignmentResponse {
  deleted: string[];
  notFound: string[];
}

