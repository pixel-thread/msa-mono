import { AUTH } from './auth';
import { USER } from './user';
import { ADMIN } from './admin';
import { ANNOUNCEMENTS } from './announcements';
import { HEALTH } from './health';
import { AUDIT_LOGS } from './audit-logs';
import { COMPLIANCE } from './compliance';
import { CONSENT } from './consent';
import { CRON } from './cron';
import { DASHBOARD } from './dashboard';
import { DSAR } from './dsar';
import { LEDGER } from './ledger';
import { MEMBERS } from './members';
import { SUBSCRIPTIONS } from './subscriptions';
import { PAYMENTS } from './payments';

export const ENDPOINTS = {
  AUTH,
  USER,
  ADMIN,
  ANNOUNCEMENTS,
  HEALTH,
  AUDIT_LOGS,
  COMPLIANCE,
  CONSENT,
  CRON,
  DASHBOARD,
  DSAR,
  LEDGER,
  MEMBERS,
  SUBSCRIPTIONS,
  PAYMENTS,
} as const;
