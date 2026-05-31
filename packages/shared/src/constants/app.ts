/**
 * Application-wide constants
 */

export const APP_NAME = 'MSA';

export const API_ROUTES = {
  AUTH: '/api/auth',
  USER: '/api/user',
  ASSOCIATIONS: '/api/associations',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  MEMBER: 'MEMBER',
  DPO: 'DPO',
} as const;
