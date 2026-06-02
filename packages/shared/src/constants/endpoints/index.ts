import { AUTH } from './auth';
import { USER } from './user';
import { ADMIN } from './admin';
import { ANNOUNCEMENTS } from './announcements';
import { HEALTH } from './health';

export const ENDPOINTS = {
  AUTH,
  USER,
  ADMIN,
  ANNOUNCEMENTS,
  HEALTH,
} as const;
