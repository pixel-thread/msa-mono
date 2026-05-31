/**
 * Global User Role Enum
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MEMBER = 'MEMBER',
  DPO = 'DPO',
}

/**
 * Common User Type
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}
