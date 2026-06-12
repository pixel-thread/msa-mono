export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PRESIDENT: 'PRESIDENT',
  SECRETARY: 'SECRETARY',
  FINANCE: 'FINANCE',
  DPO: 'DPO',
  MEMBER: 'MEMBER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  ANONYMIZED: 'ANONYMIZED',
  PENDING: 'PENDING',
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const AnnouncementStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SCHEDULED: 'SCHEDULED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type AnnouncementStatus = (typeof AnnouncementStatus)[keyof typeof AnnouncementStatus];

export const AnnouncementPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type AnnouncementPriority = (typeof AnnouncementPriority)[keyof typeof AnnouncementPriority];

export const MeetingType = {
  EC_MEETING: 'EC_MEETING',
  GENERAL_MEETING: 'GENERAL_MEETING',
} as const;

export type MeetingType = (typeof MeetingType)[keyof typeof MeetingType];

export const MeetingStatus = {
  SCHEDULED: 'SCHEDULED',
  NOTICE_ISSUED: 'NOTICE_ISSUED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type MeetingStatus = (typeof MeetingStatus)[keyof typeof MeetingStatus];

export const AttendeeRole = {
  HOST: 'HOST',
  CO_HOST: 'CO_HOST',
  REQUIRED: 'REQUIRED',
  OPTIONAL: 'OPTIONAL',
  OBSERVER: 'OBSERVER',
} as const;

export type AttendeeRole = (typeof AttendeeRole)[keyof typeof AttendeeRole];

export const RsvpStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
} as const;

export type RsvpStatus = (typeof RsvpStatus)[keyof typeof RsvpStatus];

export const DsarRequestType = {
  ACCESS: 'ACCESS',
  CORRECTION: 'CORRECTION',
  DELETION: 'DELETION',
  PORTABILITY: 'PORTABILITY',
} as const;

export type DsarRequestType = (typeof DsarRequestType)[keyof typeof DsarRequestType];

export const DsarStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
} as const;

export type DsarStatus = (typeof DsarStatus)[keyof typeof DsarStatus];

export const ConsentPurpose = {
  PAYMENTS: 'PAYMENTS',
  COMMUNICATIONS: 'COMMUNICATIONS',
  MEETINGS: 'MEETINGS',
  ANALYTICS: 'ANALYTICS',
  MARKETING: 'MARKETING',
} as const;

export type ConsentPurpose = (typeof ConsentPurpose)[keyof typeof ConsentPurpose];

export const ConsentStatus = {
  GRANTED: 'GRANTED',
  WITHDRAWN: 'WITHDRAWN',
} as const;

export type ConsentStatus = (typeof ConsentStatus)[keyof typeof ConsentStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  WAIVED: 'WAIVED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  UPI: 'UPI',
  CHEQUE: 'CHEQUE',
  ONLINE: 'ONLINE',
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentGateway = {
  RAZORPAY: 'RAZORPAY',
  MANUAL: 'MANUAL',
} as const;

export type PaymentGateway = (typeof PaymentGateway)[keyof typeof PaymentGateway];

export const ContributionStatus = {
  DUE: 'DUE',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  WAIVED: 'WAIVED',
  OVERDUE: 'OVERDUE',
} as const;

export type ContributionStatus = (typeof ContributionStatus)[keyof typeof ContributionStatus];

export const PaymentProviderType = {
  RAZORPAY: 'RAZORPAY',
  STRIPE: 'STRIPE',
  PAYU: 'PAYU',
  CASHFREE: 'CASHFREE',
} as const;

export type PaymentProviderType = (typeof PaymentProviderType)[keyof typeof PaymentProviderType];

export const AuditAction = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  CONSENT_GRANT: 'CONSENT_GRANT',
  CONSENT_REVOKE: 'CONSENT_REVOKE',
  DSAR_SUBMIT: 'DSAR_SUBMIT',
  DSAR_RESPOND: 'DSAR_RESPOND',
  PAYMENT_RECORD: 'PAYMENT_RECORD',
  SUBSCRIPTION_CHANGE: 'SUBSCRIPTION_CHANGE',
  ANONYMIZE: 'ANONYMIZE',
  ROLE_CHANGE: 'ROLE_CHANGE',
  MEETING_ASSIGN: 'MEETING_ASSIGN',
  MEETING_RSVP: 'MEETING_RSVP',
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  PAYMENT_VERIFIED: 'PAYMENT_VERIFIED',
  PAYMENT_WAIVED: 'PAYMENT_WAIVED',
  WEBHOOK_RECEIVED: 'WEBHOOK_RECEIVED',
  REPORT_EXPORTED: 'REPORT_EXPORTED',
  ANNOUNCEMENT_CREATE: 'ANNOUNCEMENT_CREATE',
  ANNOUNCEMENT_PUBLISH: 'ANNOUNCEMENT_PUBLISH',
  ANNOUNCEMENT_DELETE: 'ANNOUNCEMENT_DELETE',
  ANNOUNCEMENT_READ: 'ANNOUNCEMENT_READ',
  TRAINING_MODULE_CREATE: 'TRAINING_MODULE_CREATE',
  TRAINING_MODULE_UPDATE: 'TRAINING_MODULE_UPDATE',
  TRAINING_COMPLETE: 'TRAINING_COMPLETE',
  TRAINING_ASSIGN: 'TRAINING_ASSIGN',
  TRAINING_UNASSIGN: 'TRAINING_UNASSIGN',
  COMPLAINT_CREATE: 'COMPLAINT_CREATE',
  COMPLAINT_UPDATE: 'COMPLAINT_UPDATE',
} as const;

export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const NotificationType = {
  GENERAL_MESSAGE: 'GENERAL_MESSAGE',
  FOLLOW: 'FOLLOW',
  SYSTEM: 'SYSTEM',
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const NOTIFICATION_TYPE_VALUES = [
  'GENERAL_MESSAGE',
  'FOLLOW',
  'SYSTEM',
] as const satisfies NotificationType[];

export const ComplaintStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export type ComplaintStatus = (typeof ComplaintStatus)[keyof typeof ComplaintStatus];

export const ComplaintCategory = {
  MEETING_CONDUCT: 'MEETING_CONDUCT',
  PAYMENT_DISPUTE: 'PAYMENT_DISPUTE',
  DATA_PRIVACY: 'DATA_PRIVACY',
  MEMBER_CONDUCT: 'MEMBER_CONDUCT',
  ADMINISTRATIVE: 'ADMINISTRATIVE',
  OTHER: 'OTHER',
} as const;

export type ComplaintCategory = (typeof ComplaintCategory)[keyof typeof ComplaintCategory];

export const ComplianceCheckStatus = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  WARNING: 'WARNING',
  SKIPPED: 'SKIPPED',
} as const;

export type ComplianceCheckStatus =
  (typeof ComplianceCheckStatus)[keyof typeof ComplianceCheckStatus];

export const TrainingAssignmentStatus = {
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  OVERDUE: 'OVERDUE',
  EXEMPT: 'EXEMPT',
} as const;

export type TrainingAssignmentStatus =
  (typeof TrainingAssignmentStatus)[keyof typeof TrainingAssignmentStatus];

export const ApplicationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ApplicationStatus = (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const ApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

export const Status = {
  DELETED: 'DELETED',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export const PaymentType = {
  SUBSCRIPTION: 'SUBSCRIPTION',
  DONATION: 'DONATION',
  EVENT_FEE: 'EVENT_FEE',
  BANK_INTEREST: 'BANK_INTEREST',
  FAMILY_CONTRIBUTION: 'FAMILY_CONTRIBUTION',
} as const;

export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

export interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  balance: {
    balance: string;
    debitTotal: string;
    creditTotal: string;
  };
}

export interface User {
  id: string;
  associationId: string;
  email: string;
  name: string;
  mobile: string | null;
  designation: string | null;
  role: UserRole[];
  status: UserStatus;
  dateOfJoiningGovt: Date | null;
  dateOfJoiningAssociation: Date | null;
  membershipNumber: string | null;
  overallConsentStatus: ConsentStatus;
  dataRetentionUntil: Date;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  imageUrl: string | null;
  password: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  mfaEnabled: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  memberTypeId: string | null;
  _count?: {
    payments?: number;
    meetingAttendances?: number;
  };
}

export const PAYMENT_REFERENCE = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CHEQUE: 'CHEQUE',
  PAYSLIP: 'PAYSLIP',
  ONLINE_PAYMENT: 'ONLINE_PAYMENT',
};

export type PaymentReference = (typeof PAYMENT_REFERENCE)[keyof typeof PAYMENT_REFERENCE];

export const BILLING_CYCLE = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY',
  QUARTERLY: 'QUARTERLY',
  HALF_YEARLY: 'HALF_YEARLY',
};

export type BillingCycle = (typeof BILLING_CYCLE)[keyof typeof BILLING_CYCLE];
