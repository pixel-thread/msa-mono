-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateEnum
CREATE TYPE "announcement_status" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "announcement_priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'FINANCE', 'DPO', 'MEMBER');

-- CreateEnum
CREATE TYPE "status" AS ENUM ('DELETED', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ANONYMIZED', 'PENDING');

-- CreateEnum
CREATE TYPE "consent_purpose" AS ENUM ('PAYMENTS', 'COMMUNICATIONS', 'MEETINGS', 'ANALYTICS', 'MARKETING');

-- CreateEnum
CREATE TYPE "consent_status" AS ENUM ('GRANTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "dsar_request_type" AS ENUM ('ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY');

-- CreateEnum
CREATE TYPE "dsar_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'ONLINE');

-- CreateEnum
CREATE TYPE "payment_type" AS ENUM ('DONATION', 'EVENT_FEE', 'BANK_INTEREST', 'FAMILY_CONTRIBUTION');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'WAIVED');

-- CreateEnum
CREATE TYPE "contribution_status" AS ENUM ('DUE', 'PARTIAL', 'PAID', 'WAIVED', 'OVERDUE', 'PENDING');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('INR');

-- CreateEnum
CREATE TYPE "payment_provider_type" AS ENUM ('RAZORPAY', 'STRIPE', 'PAYU', 'CASHFREE');

-- CreateEnum
CREATE TYPE "payment_gateway" AS ENUM ('RAZORPAY', 'MANUAL');

-- CreateEnum
CREATE TYPE "approval_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "meeting_type" AS ENUM ('EC_MEETING', 'GENERAL_MEETING');

-- CreateEnum
CREATE TYPE "meeting_status" AS ENUM ('SCHEDULED', 'NOTICE_ISSUED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "attendee_role" AS ENUM ('HOST', 'CO_HOST', 'REQUIRED', 'OPTIONAL', 'OBSERVER');

-- CreateEnum
CREATE TYPE "rsvp_status" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CONSENT_GRANT', 'CONSENT_REVOKE', 'DSAR_SUBMIT', 'DSAR_RESPOND', 'PAYMENT_RECORD', 'SUBSCRIPTION_CHANGE', 'ANONYMIZE', 'ROLE_CHANGE', 'MEETING_ASSIGN', 'MEETING_RSVP', 'PAYMENT_CREATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PAYMENT_VERIFIED', 'PAYMENT_WAIVED', 'WEBHOOK_RECEIVED', 'REPORT_EXPORTED', 'ANNOUNCEMENT_CREATE', 'ANNOUNCEMENT_PUBLISH', 'ANNOUNCEMENT_DELETE', 'ANNOUNCEMENT_READ', 'TRAINING_MODULE_CREATE', 'TRAINING_MODULE_UPDATE', 'TRAINING_COMPLETE', 'TRAINING_ASSIGN', 'TRAINING_UNASSIGN', 'COMPLAINT_CREATE', 'COMPLAINT_UPDATE', 'LEDGER_TRANSFER');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GENERAL_MESSAGE', 'FOLLOW', 'SYSTEM');

-- CreateEnum
CREATE TYPE "training_assignment_status" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'EXEMPT');

-- CreateEnum
CREATE TYPE "complaint_category" AS ENUM ('MEETING_CONDUCT', 'PAYMENT_DISPUTE', 'DATA_PRIVACY', 'MEMBER_CONDUCT', 'ADMINISTRATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "complaint_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "compliance_check_status" AS ENUM ('PASSED', 'FAILED', 'WARNING', 'SKIPPED');

-- CreateEnum
CREATE TYPE "DeclarationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "document_reference_type" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'PAYSLIP', 'ONLINE_PAYMENT', 'TEXT', 'FILE');

-- CreateEnum
CREATE TYPE "eas_webhook_event_type" AS ENUM ('BUILD', 'SUBMIT');

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "announcement_status" NOT NULL DEFAULT 'DRAFT',
    "priority" "announcement_priority" NOT NULL DEFAULT 'NORMAL',
    "targetRoles" "user_role"[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageFileId" TEXT,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_reads" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "associations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "country" TEXT NOT NULL DEFAULT 'IN',
    "state" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "currencyCode" TEXT NOT NULL DEFAULT 'INR',
    "primaryColor" TEXT DEFAULT '#1f2937',
    "secondaryColor" TEXT DEFAULT '#3b82f6',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "audit_action" NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "traceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_receipts" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" "consent_purpose" NOT NULL,
    "status" "consent_status" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'web',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "complaint_category" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "complaint_status" NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedToId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_checks" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" "compliance_check_status" NOT NULL,
    "score" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "recommendations" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_periods" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "expectedAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dueAmount" DECIMAL(10,2) NOT NULL,
    "status" "contribution_status" NOT NULL DEFAULT 'DUE',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contribution_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "declarations" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "declerationStartDate" TIMESTAMP(3) NOT NULL,
    "declerationEndDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "DeclarationStatus" NOT NULL DEFAULT 'PENDING',
    "lastDeclarationDate" TIMESTAMP(3),
    "reviewBy" TEXT,
    "reviewAt" TIMESTAMP(3),
    "remark" TEXT,

    CONSTRAINT "declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_references" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT,
    "ledgerEntryId" TEXT,
    "type" "document_reference_type" NOT NULL,
    "reference" TEXT,
    "fileId" TEXT,
    "paidAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dsar_tickets" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" "dsar_request_type" NOT NULL,
    "requestedData" TEXT[],
    "description" TEXT,
    "status" "dsar_status" NOT NULL DEFAULT 'PENDING',
    "assignedToId" TEXT,
    "responseDeadline" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '21 days'),
    "rejectedReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dsar_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dsar_responses" (
    "id" TEXT NOT NULL,
    "dsarTicketId" TEXT NOT NULL,
    "responseType" TEXT NOT NULL,
    "storageKey" TEXT,
    "deliveryMethod" TEXT NOT NULL DEFAULT 'secure_download',
    "notes" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dsar_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eas_builds" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "buildProfile" TEXT NOT NULL,
    "buildUrl" TEXT,
    "appVersion" TEXT,
    "appBuildVersion" TEXT,
    "runtimeVersion" TEXT,
    "channel" TEXT,
    "distribution" TEXT,
    "gitCommitHash" TEXT,
    "gitCommitMessage" TEXT,
    "sdkVersion" TEXT,
    "cliVersion" TEXT,
    "initiatingUserId" TEXT,
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "message" TEXT,
    "runFromCI" BOOLEAN NOT NULL DEFAULT false,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rawEventId" TEXT NOT NULL,

    CONSTRAINT "eas_builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eas_submissions" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "archiveUrl" TEXT,
    "turtleBuildId" TEXT,
    "initiatingUserId" TEXT,
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "logsUrl" TEXT,
    "submissionDetailsPageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "rawEventId" TEXT NOT NULL,

    CONSTRAINT "eas_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eas_webhook_events" (
    "id" TEXT NOT NULL,
    "eventType" "eas_webhook_event_type" NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eas_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "associationId" TEXT,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT,
    "sizeBytes" INTEGER NOT NULL,
    "bucket" TEXT,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "durationSeconds" INTEGER,
    "checksum" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trainingCertificateId" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT,
    "description" TEXT NOT NULL,
    "approvalStatus" "approval_status" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_lines" (
    "id" TEXT NOT NULL,
    "ledgerEntryId" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "isDebit" BOOLEAN NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "isBackend" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "meeting_type" NOT NULL,
    "status" "meeting_status" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "noticeIssuedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_attendees" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendeeRole" "attendee_role" NOT NULL DEFAULT 'OPTIONAL',
    "rsvpStatus" "rsvp_status" NOT NULL DEFAULT 'PENDING',
    "rsvpNote" TEXT,
    "rsvpAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_items" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_minutes" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "agendaPoint" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "actionItems" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_minutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_types" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "associationId" TEXT NOT NULL,

    CONSTRAINT "member_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "body" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isReceived" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3),
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "associationId" TEXT NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_providers" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "provider" "payment_provider_type" NOT NULL,
    "keyId" TEXT NOT NULL,
    "encryptedKeySecret" TEXT NOT NULL,
    "encryptedWebhookSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "gateway" "payment_gateway" NOT NULL DEFAULT 'RAZORPAY',
    "status" "payment_status" NOT NULL DEFAULT 'PENDING',
    "method" "payment_method",
    "notes" TEXT,
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "razorpayRefundId" TEXT,
    "receiptUrl" TEXT,
    "invoiceUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "verifiedById" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contributionId" TEXT,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_allocations" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT NOT NULL,
    "contributionPeriodId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "eventType" TEXT NOT NULL,
    "gateway" "payment_gateway" NOT NULL DEFAULT 'RAZORPAY',
    "payload" JSONB NOT NULL,
    "signature" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retroactive_adjustments" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "oldAmount" DECIMAL(10,2) NOT NULL,
    "newAmount" DECIMAL(10,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retroactive_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retroactive_affected_users" (
    "id" TEXT NOT NULL,
    "retroactiveAdjustmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contributionPeriodId" TEXT NOT NULL,
    "previousExpectedAmount" DECIMAL(10,2) NOT NULL,
    "newExpectedAmount" DECIMAL(10,2) NOT NULL,
    "adjustmentAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "retroactive_affected_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plans" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "memberTypeId" TEXT,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_versions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "description" TEXT,
    "status" "status" NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_modules" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "requiredForRoles" "user_role"[] DEFAULT ARRAY['MEMBER']::"user_role"[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "certificateTemplateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "scorePercent" DECIMAL(5,2),
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_assignments" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "training_assignment_status" NOT NULL DEFAULT 'ASSIGNED',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "reminderSentAt" TIMESTAMP(3),
    "assignedById" TEXT,
    "notes" TEXT,

    CONSTRAINT "training_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_supplements" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "downloadUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "imageUrl" TEXT,
    "fileId" TEXT,
    "sortOrder" SERIAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_supplements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_certificates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "certificateNumber" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileId" TEXT,

    CONSTRAINT "training_certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_certificate_templates" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "certificateUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "fileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_certificate_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT,
    "mobile" TEXT,
    "designation" TEXT,
    "role" "user_role"[],
    "status" "user_status" NOT NULL DEFAULT 'ACTIVE',
    "dateOfJoiningGovt" TIMESTAMP(3),
    "dateOfJoiningAssociation" TIMESTAMP(3),
    "dateOfRetirement" TIMESTAMP(3),
    "dob" TIMESTAMP(3),
    "membershipNumber" TEXT,
    "overallConsentStatus" "consent_status" NOT NULL DEFAULT 'GRANTED',
    "dataRetentionUntil" TIMESTAMP(3) NOT NULL DEFAULT (NOW() + INTERVAL '7 years'),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "imageUrl" TEXT,
    "password" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "memberTypeId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_applications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "associationSlug" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contribution_waivers" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "waivedAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "waivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contribution_waivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContributionPeriodToDeclarations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContributionPeriodToDeclarations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "announcements_imageFileId_key" ON "announcements"("imageFileId");

-- CreateIndex
CREATE INDEX "announcements_associationId_status_idx" ON "announcements"("associationId", "status");

-- CreateIndex
CREATE INDEX "announcements_publishedAt_idx" ON "announcements"("publishedAt");

-- CreateIndex
CREATE INDEX "announcement_reads_userId_idx" ON "announcement_reads"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_reads_announcementId_userId_key" ON "announcement_reads"("announcementId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "associations_slug_key" ON "associations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "associations_name_key" ON "associations"("name");

-- CreateIndex
CREATE INDEX "associations_slug_idx" ON "associations"("slug");

-- CreateIndex
CREATE INDEX "associations_isActive_idx" ON "associations"("isActive");

-- CreateIndex
CREATE INDEX "audit_logs_associationId_idx" ON "audit_logs"("associationId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_resourceId_idx" ON "audit_logs"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "verification_codes_userId_idx" ON "verification_codes"("userId");

-- CreateIndex
CREATE INDEX "verification_codes_expiresAt_idx" ON "verification_codes"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "push_tokens"("token");

-- CreateIndex
CREATE INDEX "push_tokens_userId_idx" ON "push_tokens"("userId");

-- CreateIndex
CREATE INDEX "consent_receipts_associationId_idx" ON "consent_receipts"("associationId");

-- CreateIndex
CREATE INDEX "consent_receipts_userId_purpose_idx" ON "consent_receipts"("userId", "purpose");

-- CreateIndex
CREATE INDEX "consent_receipts_createdAt_idx" ON "consent_receipts"("createdAt");

-- CreateIndex
CREATE INDEX "complaints_associationId_idx" ON "complaints"("associationId");

-- CreateIndex
CREATE INDEX "complaints_userId_idx" ON "complaints"("userId");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "compliance_checks_associationId_idx" ON "compliance_checks"("associationId");

-- CreateIndex
CREATE INDEX "compliance_checks_checkType_idx" ON "compliance_checks"("checkType");

-- CreateIndex
CREATE INDEX "compliance_checks_status_idx" ON "compliance_checks"("status");

-- CreateIndex
CREATE INDEX "compliance_checks_checkedAt_idx" ON "compliance_checks"("checkedAt");

-- CreateIndex
CREATE INDEX "contribution_periods_associationId_idx" ON "contribution_periods"("associationId");

-- CreateIndex
CREATE INDEX "contribution_periods_userId_idx" ON "contribution_periods"("userId");

-- CreateIndex
CREATE INDEX "contribution_periods_status_idx" ON "contribution_periods"("status");

-- CreateIndex
CREATE UNIQUE INDEX "contribution_periods_userId_year_month_key" ON "contribution_periods"("userId", "year", "month");

-- CreateIndex
CREATE INDEX "document_references_paymentTransactionId_idx" ON "document_references"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "document_references_ledgerEntryId_idx" ON "document_references"("ledgerEntryId");

-- CreateIndex
CREATE INDEX "document_references_fileId_idx" ON "document_references"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "dsar_tickets_ticketNumber_key" ON "dsar_tickets"("ticketNumber");

-- CreateIndex
CREATE INDEX "dsar_tickets_associationId_idx" ON "dsar_tickets"("associationId");

-- CreateIndex
CREATE INDEX "dsar_tickets_userId_idx" ON "dsar_tickets"("userId");

-- CreateIndex
CREATE INDEX "dsar_tickets_status_idx" ON "dsar_tickets"("status");

-- CreateIndex
CREATE INDEX "dsar_tickets_responseDeadline_idx" ON "dsar_tickets"("responseDeadline");

-- CreateIndex
CREATE UNIQUE INDEX "dsar_tickets_associationId_ticketNumber_key" ON "dsar_tickets"("associationId", "ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "eas_builds_rawEventId_key" ON "eas_builds"("rawEventId");

-- CreateIndex
CREATE UNIQUE INDEX "eas_submissions_rawEventId_key" ON "eas_submissions"("rawEventId");

-- CreateIndex
CREATE INDEX "files_associationId_idx" ON "files"("associationId");

-- CreateIndex
CREATE INDEX "files_mimeType_idx" ON "files"("mimeType");

-- CreateIndex
CREATE INDEX "ledger_entries_paymentTransactionId_idx" ON "ledger_entries"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "ledger_lines_ledgerEntryId_idx" ON "ledger_lines"("ledgerEntryId");

-- CreateIndex
CREATE INDEX "accounts_associationId_idx" ON "accounts"("associationId");

-- CreateIndex
CREATE INDEX "accounts_code_idx" ON "accounts"("code");

-- CreateIndex
CREATE INDEX "accounts_associationId_code_idx" ON "accounts"("associationId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_associationId_code_key" ON "accounts"("associationId", "code");

-- CreateIndex
CREATE INDEX "meetings_associationId_idx" ON "meetings"("associationId");

-- CreateIndex
CREATE INDEX "meetings_type_idx" ON "meetings"("type");

-- CreateIndex
CREATE INDEX "meetings_status_idx" ON "meetings"("status");

-- CreateIndex
CREATE INDEX "meetings_scheduledAt_idx" ON "meetings"("scheduledAt");

-- CreateIndex
CREATE INDEX "meeting_attendees_meetingId_idx" ON "meeting_attendees"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_attendees_userId_idx" ON "meeting_attendees"("userId");

-- CreateIndex
CREATE INDEX "meeting_attendees_rsvpStatus_idx" ON "meeting_attendees"("rsvpStatus");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_meetingId_userId_key" ON "meeting_attendees"("meetingId", "userId");

-- CreateIndex
CREATE INDEX "agenda_items_meetingId_idx" ON "agenda_items"("meetingId");

-- CreateIndex
CREATE INDEX "member_types_level_idx" ON "member_types"("level");

-- CreateIndex
CREATE UNIQUE INDEX "member_types_associationId_level_key" ON "member_types"("associationId", "level");

-- CreateIndex
CREATE INDEX "notifications_associationId_idx" ON "notifications"("associationId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "payment_providers_associationId_idx" ON "payment_providers"("associationId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_razorpayOrderId_key" ON "payment_transactions"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_razorpayPaymentId_key" ON "payment_transactions"("razorpayPaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_contributionId_key" ON "payment_transactions"("contributionId");

-- CreateIndex
CREATE INDEX "payment_transactions_associationId_idx" ON "payment_transactions"("associationId");

-- CreateIndex
CREATE INDEX "payment_transactions_userId_idx" ON "payment_transactions"("userId");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "payment_transactions_paymentDate_idx" ON "payment_transactions"("paymentDate");

-- CreateIndex
CREATE INDEX "payment_allocations_paymentTransactionId_idx" ON "payment_allocations"("paymentTransactionId");

-- CreateIndex
CREATE INDEX "payment_allocations_contributionPeriodId_idx" ON "payment_allocations"("contributionPeriodId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_events_eventId_key" ON "payment_webhook_events"("eventId");

-- CreateIndex
CREATE INDEX "payment_webhook_events_eventType_idx" ON "payment_webhook_events"("eventType");

-- CreateIndex
CREATE INDEX "payment_webhook_events_processed_idx" ON "payment_webhook_events"("processed");

-- CreateIndex
CREATE INDEX "retroactive_adjustments_associationId_idx" ON "retroactive_adjustments"("associationId");

-- CreateIndex
CREATE INDEX "retroactive_adjustments_planId_idx" ON "retroactive_adjustments"("planId");

-- CreateIndex
CREATE INDEX "retroactive_adjustments_createdAt_idx" ON "retroactive_adjustments"("createdAt");

-- CreateIndex
CREATE INDEX "retroactive_affected_users_retroactiveAdjustmentId_idx" ON "retroactive_affected_users"("retroactiveAdjustmentId");

-- CreateIndex
CREATE INDEX "retroactive_affected_users_userId_idx" ON "retroactive_affected_users"("userId");

-- CreateIndex
CREATE INDEX "retroactive_affected_users_contributionPeriodId_idx" ON "retroactive_affected_users"("contributionPeriodId");

-- CreateIndex
CREATE INDEX "plans_associationId_idx" ON "plans"("associationId");

-- CreateIndex
CREATE UNIQUE INDEX "plans_associationId_name_key" ON "plans"("associationId", "name");

-- CreateIndex
CREATE INDEX "plan_versions_planId_idx" ON "plan_versions"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "training_modules_certificateTemplateId_key" ON "training_modules"("certificateTemplateId");

-- CreateIndex
CREATE INDEX "training_modules_associationId_idx" ON "training_modules"("associationId");

-- CreateIndex
CREATE UNIQUE INDEX "training_modules_associationId_title_key" ON "training_modules"("associationId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "training_completions_userId_moduleId_key" ON "training_completions"("userId", "moduleId");

-- CreateIndex
CREATE INDEX "training_assignments_userId_idx" ON "training_assignments"("userId");

-- CreateIndex
CREATE INDEX "training_assignments_moduleId_idx" ON "training_assignments"("moduleId");

-- CreateIndex
CREATE INDEX "training_assignments_status_idx" ON "training_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "training_assignments_moduleId_userId_key" ON "training_assignments"("moduleId", "userId");

-- CreateIndex
CREATE INDEX "training_supplements_moduleId_idx" ON "training_supplements"("moduleId");

-- CreateIndex
CREATE INDEX "training_supplements_sortOrder_idx" ON "training_supplements"("sortOrder");

-- CreateIndex
CREATE INDEX "training_supplements_moduleId_isActive_idx" ON "training_supplements"("moduleId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "training_certificates_certificateNumber_key" ON "training_certificates"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "training_certificates_fileId_key" ON "training_certificates"("fileId");

-- CreateIndex
CREATE INDEX "training_certificates_userId_idx" ON "training_certificates"("userId");

-- CreateIndex
CREATE INDEX "training_certificates_moduleId_idx" ON "training_certificates"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "training_certificates_userId_moduleId_key" ON "training_certificates"("userId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "training_certificate_templates_fileId_key" ON "training_certificate_templates"("fileId");

-- CreateIndex
CREATE INDEX "training_certificate_templates_associationId_idx" ON "training_certificate_templates"("associationId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_associationId_idx" ON "users"("associationId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_dataRetentionUntil_idx" ON "users"("dataRetentionUntil");

-- CreateIndex
CREATE INDEX "users_passwordResetToken_idx" ON "users"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_associationId_email_key" ON "users"("associationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "users_associationId_membershipNumber_key" ON "users"("associationId", "membershipNumber");

-- CreateIndex
CREATE INDEX "membership_applications_email_idx" ON "membership_applications"("email");

-- CreateIndex
CREATE INDEX "membership_applications_phone_idx" ON "membership_applications"("phone");

-- CreateIndex
CREATE INDEX "membership_applications_associationSlug_idx" ON "membership_applications"("associationSlug");

-- CreateIndex
CREATE INDEX "membership_applications_status_idx" ON "membership_applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_email_associationSlug_key" ON "membership_applications"("email", "associationSlug");

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_phone_associationSlug_key" ON "membership_applications"("phone", "associationSlug");

-- CreateIndex
CREATE UNIQUE INDEX "contribution_waivers_periodId_key" ON "contribution_waivers"("periodId");

-- CreateIndex
CREATE INDEX "contribution_waivers_periodId_idx" ON "contribution_waivers"("periodId");

-- CreateIndex
CREATE INDEX "_ContributionPeriodToDeclarations_B_index" ON "_ContributionPeriodToDeclarations"("B");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_tokens" ADD CONSTRAINT "push_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_receipts" ADD CONSTRAINT "consent_receipts_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_receipts" ADD CONSTRAINT "consent_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_periods" ADD CONSTRAINT "contribution_periods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "declarations" ADD CONSTRAINT "declarations_reviewBy_fkey" FOREIGN KEY ("reviewBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_references" ADD CONSTRAINT "document_references_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_references" ADD CONSTRAINT "document_references_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "ledger_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_references" ADD CONSTRAINT "document_references_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dsar_tickets" ADD CONSTRAINT "dsar_tickets_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dsar_tickets" ADD CONSTRAINT "dsar_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dsar_tickets" ADD CONSTRAINT "dsar_tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dsar_responses" ADD CONSTRAINT "dsar_responses_dsarTicketId_fkey" FOREIGN KEY ("dsarTicketId") REFERENCES "dsar_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eas_builds" ADD CONSTRAINT "eas_builds_rawEventId_fkey" FOREIGN KEY ("rawEventId") REFERENCES "eas_webhook_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eas_submissions" ADD CONSTRAINT "eas_submissions_rawEventId_fkey" FOREIGN KEY ("rawEventId") REFERENCES "eas_webhook_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_lines" ADD CONSTRAINT "ledger_lines_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_lines" ADD CONSTRAINT "ledger_lines_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_lines" ADD CONSTRAINT "ledger_lines_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "ledger_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_attendees" ADD CONSTRAINT "meeting_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_items" ADD CONSTRAINT "agenda_items_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_minutes" ADD CONSTRAINT "meeting_minutes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_types" ADD CONSTRAINT "member_types_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_providers" ADD CONSTRAINT "payment_providers_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_contributionId_fkey" FOREIGN KEY ("contributionId") REFERENCES "contribution_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_allocations" ADD CONSTRAINT "payment_allocations_contributionPeriodId_fkey" FOREIGN KEY ("contributionPeriodId") REFERENCES "contribution_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retroactive_affected_users" ADD CONSTRAINT "retroactive_affected_users_retroactiveAdjustmentId_fkey" FOREIGN KEY ("retroactiveAdjustmentId") REFERENCES "retroactive_adjustments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retroactive_affected_users" ADD CONSTRAINT "retroactive_affected_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retroactive_affected_users" ADD CONSTRAINT "retroactive_affected_users_contributionPeriodId_fkey" FOREIGN KEY ("contributionPeriodId") REFERENCES "contribution_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plans" ADD CONSTRAINT "plans_memberTypeId_fkey" FOREIGN KEY ("memberTypeId") REFERENCES "member_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_versions" ADD CONSTRAINT "plan_versions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_modules" ADD CONSTRAINT "training_modules_certificateTemplateId_fkey" FOREIGN KEY ("certificateTemplateId") REFERENCES "training_certificate_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_modules" ADD CONSTRAINT "training_modules_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_completions" ADD CONSTRAINT "training_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_completions" ADD CONSTRAINT "training_completions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_assignments" ADD CONSTRAINT "training_assignments_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_assignments" ADD CONSTRAINT "training_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_supplements" ADD CONSTRAINT "training_supplements_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_supplements" ADD CONSTRAINT "training_supplements_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_certificates" ADD CONSTRAINT "training_certificates_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_certificates" ADD CONSTRAINT "training_certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_certificates" ADD CONSTRAINT "training_certificates_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_certificate_templates" ADD CONSTRAINT "training_certificate_templates_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_memberTypeId_fkey" FOREIGN KEY ("memberTypeId") REFERENCES "member_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contribution_waivers" ADD CONSTRAINT "contribution_waivers_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "contribution_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContributionPeriodToDeclarations" ADD CONSTRAINT "_ContributionPeriodToDeclarations_A_fkey" FOREIGN KEY ("A") REFERENCES "contribution_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContributionPeriodToDeclarations" ADD CONSTRAINT "_ContributionPeriodToDeclarations_B_fkey" FOREIGN KEY ("B") REFERENCES "declarations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
