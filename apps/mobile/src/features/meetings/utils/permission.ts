import { UserRole } from '@src/shared/types/role';

export const HIGH_ROLE_USERS: UserRole[] = ['SUPER_ADMIN', 'PRESIDENT', 'SECRETARY'];

export const hasHighRoleAccess = (role?: UserRole[]): boolean => {
  if (!role) return false;
  return !!HIGH_ROLE_USERS.some((r) => role.includes(r));
};
