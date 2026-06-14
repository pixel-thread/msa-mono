import { ADMIN } from "./admin";
import { ANNOUNCEMENTS } from "./announcements";
import { ASSOCIATIONS } from "./associations";
import { AUDIT_LOGS } from "./audit-logs";
import { AUTH } from "./auth";
import { COMPLIANCE } from "./compliance";
import { CONSENT } from "./consent";
import { CONTRIBUTION } from "./contributions";
import { CRON } from "./cron";
import { DASHBOARD } from "./dashboard";
import { DSAR } from "./dsar";
import { EAS } from "./eas";
import { HEALTH } from "./health";
import { LEDGER } from "./ledger";
import { LOGS } from "./logs";
import { MEETINGS } from "./meetings";
import { MEMBERS } from "./members";
import { MEMBER_TYPES } from "./member-types";
import { MEMBERSHIP_APPLICATIONS } from "./membership-applications";
import { NOTIFICATIONS } from "./notifications";
import { PAYMENTS } from "./payments";
import { PLANS } from "./plans";
import { TRAINING } from "./training";
import { USER } from "./user";

export const ENDPOINTS = {
  ADMIN,
  ANNOUNCEMENTS,
  ASSOCIATIONS,
  AUDIT_LOGS,
  AUTH,
  COMPLIANCE,
  CONSENT,
  CONTRIBUTION,
  CRON,
  DASHBOARD,
  DSAR,
  EAS,
  HEALTH,
  LEDGER,
  LOGS,
  MEETINGS,
  MEMBERS,
  MEMBER_TYPES,
  MEMBERSHIP_APPLICATIONS,
  NOTIFICATIONS,
  PAYMENTS,
  PLANS,
  TRAINING,
  USER,
} as const;
