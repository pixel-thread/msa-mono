import { AUTH } from "./auth";
import { USER } from "./user";
import { ADMIN } from "./admin";
import { ANNOUNCEMENTS } from "./announcements";
import { ASSOCIATIONS } from "./associations";
import { AUDIT_LOGS } from "./audit-logs";
import { COMPLIANCE } from "./compliance";
import { CONSENT } from "./consent";
import { CONTRIBUTION } from "./contributions";
import { CRON } from "./cron";
import { DASHBOARD } from "./dashboard";
import { DSAR } from "./dsar";
import { HEALTH } from "./health";
import { LEDGER } from "./ledger";
import { LOGS } from "./logs";
import { MEETINGS } from "./meetings";
import { MEMBERS } from "./members";
import { MEMBER_TYPES } from "./member-types";
import { NOTIFICATIONS } from "./notifications";
import { PAYMENTS } from "./payments";
import { SUBSCRIPTIONS } from "./subscriptions";
import { TRAINING } from "./training";

export const ENDPOINTS = {
  AUTH,
  USER,
  ADMIN,
  ANNOUNCEMENTS,
  ASSOCIATIONS,
  AUDIT_LOGS,
  COMPLIANCE,
  CONSENT,
  CONTRIBUTION,
  CRON,
  DASHBOARD,
  DSAR,
  HEALTH,
  LEDGER,
  LOGS,
  MEETINGS,
  MEMBERS,
  MEMBER_TYPES,
  NOTIFICATIONS,
  PAYMENTS,
  SUBSCRIPTIONS,
  TRAINING,
} as const;
