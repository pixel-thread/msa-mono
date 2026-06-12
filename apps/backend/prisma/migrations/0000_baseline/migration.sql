-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA "public" VERSION "1.6";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "public" VERSION "1.3";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog" VERSION "1.0";

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('INR');

-- CreateEnum
CREATE TYPE "public"."DeclarationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('GENERAL_MESSAGE', 'FOLLOW', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."announcement_priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."announcement_status" AS ENUM ('DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."approval_status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."attendee_role" AS ENUM ('HOST', 'CO_HOST', 'REQUIRED', 'OPTIONAL', 'OBSERVER');

-- CreateEnum
CREATE TYPE "public"."audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'CONSENT_GRANT', 'CONSENT_REVOKE', 'DSAR_SUBMIT', 'DSAR_RESPOND', 'PAYMENT_RECORD', 'SUBSCRIPTION_CHANGE', 'ANONYMIZE', 'ROLE_CHANGE', 'MEETING_ASSIGN', 'MEETING_RSVP', 'PAYMENT_CREATED', 'PAYMENT_COMPLETED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PAYMENT_VERIFIED', 'PAYMENT_WAIVED', 'WEBHOOK_RECEIVED', 'REPORT_EXPORTED', 'ANNOUNCEMENT_CREATE', 'ANNOUNCEMENT_PUBLISH', 'ANNOUNCEMENT_DELETE', 'ANNOUNCEMENT_READ', 'TRAINING_MODULE_CREATE', 'TRAINING_MODULE_UPDATE', 'TRAINING_COMPLETE', 'TRAINING_ASSIGN', 'TRAINING_UNASSIGN', 'COMPLAINT_CREATE', 'COMPLAINT_UPDATE', 'LEDGER_TRANSFER');

-- CreateEnum
CREATE TYPE "public"."complaint_category" AS ENUM ('MEETING_CONDUCT', 'PAYMENT_DISPUTE', 'DATA_PRIVACY', 'MEMBER_CONDUCT', 'ADMINISTRATIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."complaint_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "public"."compliance_check_status" AS ENUM ('PASSED', 'FAILED', 'WARNING', 'SKIPPED');

-- CreateEnum
CREATE TYPE "public"."consent_purpose" AS ENUM ('PAYMENTS', 'COMMUNICATIONS', 'MEETINGS', 'ANALYTICS', 'MARKETING');

-- CreateEnum
CREATE TYPE "public"."consent_status" AS ENUM ('GRANTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."contribution_status" AS ENUM ('DUE', 'PARTIAL', 'PAID', 'WAIVED', 'OVERDUE', 'PENDING');

-- CreateEnum
CREATE TYPE "public"."document_reference_type" AS ENUM ('CASH', 'BANK_TRANSFER', 'CHEQUE', 'PAYSLIP', 'ONLINE_PAYMENT', 'TEXT', 'FILE');

-- CreateEnum
CREATE TYPE "public"."dsar_request_type" AS ENUM ('ACCESS', 'CORRECTION', 'DELETION', 'PORTABILITY');

-- CreateEnum
CREATE TYPE "public"."dsar_status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."eas_webhook_event_type" AS ENUM ('BUILD', 'SUBMIT');

-- CreateEnum
CREATE TYPE "public"."meeting_status" AS ENUM ('SCHEDULED', 'NOTICE_ISSUED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."meeting_type" AS ENUM ('EC_MEETING', 'GENERAL_MEETING');

-- CreateEnum
CREATE TYPE "public"."payment_gateway" AS ENUM ('RAZORPAY', 'MANUAL');

-- CreateEnum
CREATE TYPE "public"."payment_method" AS ENUM ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'ONLINE');

-- CreateEnum
CREATE TYPE "public"."payment_provider_type" AS ENUM ('RAZORPAY', 'STRIPE', 'PAYU', 'CASHFREE');

-- CreateEnum
CREATE TYPE "public"."payment_status" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'WAIVED');

-- CreateEnum
CREATE TYPE "public"."payment_type" AS ENUM ('SUBSCRIPTION', 'DONATION', 'EVENT_FEE', 'BANK_INTEREST', 'FAMILY_CONTRIBUTION');

-- CreateEnum
CREATE TYPE "public"."rsvp_status" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "public"."status" AS ENUM ('DELETED', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "public"."training_assignment_status" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'EXEMPT');

-- CreateEnum
CREATE TYPE "public"."user_role" AS ENUM ('SUPER_ADMIN', 'PRESIDENT', 'SECRETARY', 'FINANCE', 'DPO', 'MEMBER');

-- CreateEnum
CREATE TYPE "public"."user_status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'ANONYMIZED', 'PENDING');

-- CreateTable
CREATE TABLE "public"."_ContributionPeriodToDeclarations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ContributionPeriodToDeclarations_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agenda_items" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agenda_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcement_reads" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcement_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."announcements" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" "public"."announcement_status" NOT NULL DEFAULT 'DRAFT',
    "priority" "public"."announcement_priority" NOT NULL DEFAULT 'NORMAL',
    "targetRoles" "public"."user_role"[],
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageFileId" TEXT,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."associations" (
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
    "status" "public"."status" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."audit_logs" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "actorId" TEXT,
    "action" "public"."audit_action" NOT NULL,
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
CREATE TABLE "public"."complaints" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "public"."complaint_category" NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."complaint_status" NOT NULL DEFAULT 'OPEN',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "assignedToId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."compliance_checks" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" "public"."compliance_check_status" NOT NULL,
    "score" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "details" JSONB,
    "recommendations" JSONB,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."consent_receipts" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" "public"."consent_purpose" NOT NULL,
    "status" "public"."consent_status" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'web',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."contribution_periods" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "expectedAmount" DECIMAL(10,2) NOT NULL,
    "paidAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "dueAmount" DECIMAL(10,2) NOT NULL,
    "status" "public"."contribution_status" NOT NULL DEFAULT 'DUE',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "waivedAt" TIMESTAMP(3),
    "waivedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contribution_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."declarations" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "declerationStartDate" TIMESTAMP(3) NOT NULL,
    "declerationEndDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "public"."DeclarationStatus" NOT NULL DEFAULT 'PENDING',
    "lastDeclarationDate" TIMESTAMP(3),
    "reviewBy" TEXT,
    "reviewAt" TIMESTAMP(3),
    "remark" TEXT,

    CONSTRAINT "declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."document_references" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT,
    "ledgerEntryId" TEXT,
    "type" "public"."document_reference_type" NOT NULL,
    "reference" TEXT,
    "fileId" TEXT,
    "paidAt" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dsar_responses" (
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
CREATE TABLE "public"."dsar_tickets" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestType" "public"."dsar_request_type" NOT NULL,
    "requestedData" TEXT[],
    "description" TEXT,
    "status" "public"."dsar_status" NOT NULL DEFAULT 'PENDING',
    "assignedToId" TEXT,
    "responseDeadline" TIMESTAMP(3) NOT NULL DEFAULT (now() + '21 days'::interval),
    "rejectedReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dsar_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."eas_builds" (
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
CREATE TABLE "public"."eas_submissions" (
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
CREATE TABLE "public"."eas_webhook_events" (
    "id" TEXT NOT NULL,
    "eventType" "public"."eas_webhook_event_type" NOT NULL,
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
CREATE TABLE "public"."files" (
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
CREATE TABLE "public"."ledger_entries" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT,
    "description" TEXT NOT NULL,
    "approvalStatus" "public"."approval_status" NOT NULL DEFAULT 'PENDING',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ledger_lines" (
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
CREATE TABLE "public"."logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "isBackend" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meeting_attendees" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attendeeRole" "public"."attendee_role" NOT NULL DEFAULT 'OPTIONAL',
    "rsvpStatus" "public"."rsvp_status" NOT NULL DEFAULT 'PENDING',
    "rsvpNote" TEXT,
    "rsvpAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meeting_minutes" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "agendaPoint" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "actionItems" JSONB,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meeting_minutes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."meetings" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."meeting_type" NOT NULL,
    "status" "public"."meeting_status" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "noticeIssuedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."member_types" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "level" INTEGER NOT NULL,
    "associationId" TEXT NOT NULL,

    CONSTRAINT "member_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."membership_applications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "associationSlug" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
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
CREATE TABLE "public"."payment_allocations" (
    "id" TEXT NOT NULL,
    "paymentTransactionId" TEXT NOT NULL,
    "contributionPeriodId" TEXT NOT NULL,
    "allocatedAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_providers" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "provider" "public"."payment_provider_type" NOT NULL,
    "keyId" TEXT NOT NULL,
    "encryptedKeySecret" TEXT NOT NULL,
    "encryptedWebhookSecret" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_transactions" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "gateway" "public"."payment_gateway" NOT NULL DEFAULT 'RAZORPAY',
    "status" "public"."payment_status" NOT NULL DEFAULT 'PENDING',
    "method" "public"."payment_method",
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

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_webhook_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT,
    "eventType" TEXT NOT NULL,
    "gateway" "public"."payment_gateway" NOT NULL DEFAULT 'RAZORPAY',
    "payload" JSONB NOT NULL,
    "signature" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."push_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_billing_history" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "amountCharged" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_billing_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_plan_versions" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "billingCycle" TEXT NOT NULL DEFAULT 'MONTHLY',
    "features" JSONB NOT NULL,
    "description" TEXT,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_plan_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_plans" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "memberTypeId" TEXT,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "waivedAt" TIMESTAMP(3),
    "waivedReason" TEXT,
    "waivedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_assignments" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "public"."training_assignment_status" NOT NULL DEFAULT 'ASSIGNED',
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
CREATE TABLE "public"."training_certificate_templates" (
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
CREATE TABLE "public"."training_certificates" (
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
CREATE TABLE "public"."training_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "scorePercent" DECIMAL(5,2),
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_modules" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "durationMinutes" INTEGER,
    "requiredForRoles" "public"."user_role"[] DEFAULT ARRAY['MEMBER']::"public"."user_role"[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "certificateTemplateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."training_supplements" (
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
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "role" "public"."user_role"[],
    "status" "public"."user_status" NOT NULL DEFAULT 'ACTIVE',
    "dateOfJoiningGovt" TIMESTAMP(3),
    "dateOfJoiningAssociation" TIMESTAMP(3),
    "membershipNumber" TEXT,
    "overallConsentStatus" "public"."consent_status" NOT NULL DEFAULT 'GRANTED',
    "dataRetentionUntil" TIMESTAMP(3) NOT NULL DEFAULT (now() + '7 years'::interval),
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
CREATE TABLE "public"."verification_codes" (
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

-- CreateIndex
CREATE INDEX "_ContributionPeriodToDeclarations_B_index" ON "public"."_ContributionPeriodToDeclarations"("B" ASC);

-- CreateIndex
CREATE INDEX "accounts_associationId_idx" ON "public"."accounts"("associationId" ASC);

-- CreateIndex
CREATE INDEX "accounts_code_idx" ON "public"."accounts"("code" ASC);

-- CreateIndex
CREATE INDEX "agenda_items_meetingId_idx" ON "public"."agenda_items"("meetingId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "announcement_reads_announcementId_userId_key" ON "public"."announcement_reads"("announcementId" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "announcement_reads_userId_idx" ON "public"."announcement_reads"("userId" ASC);

-- CreateIndex
CREATE INDEX "announcements_associationId_status_idx" ON "public"."announcements"("associationId" ASC, "status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "announcements_imageFileId_key" ON "public"."announcements"("imageFileId" ASC);

-- CreateIndex
CREATE INDEX "announcements_publishedAt_idx" ON "public"."announcements"("publishedAt" ASC);

-- CreateIndex
CREATE INDEX "associations_isActive_idx" ON "public"."associations"("isActive" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "associations_name_key" ON "public"."associations"("name" ASC);

-- CreateIndex
CREATE INDEX "associations_slug_idx" ON "public"."associations"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "associations_slug_key" ON "public"."associations"("slug" ASC);

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action" ASC);

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "public"."audit_logs"("actorId" ASC);

-- CreateIndex
CREATE INDEX "audit_logs_associationId_idx" ON "public"."audit_logs"("associationId" ASC);

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "public"."audit_logs"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "audit_logs_resourceType_resourceId_idx" ON "public"."audit_logs"("resourceType" ASC, "resourceId" ASC);

-- CreateIndex
CREATE INDEX "complaints_associationId_idx" ON "public"."complaints"("associationId" ASC);

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "public"."complaints"("status" ASC);

-- CreateIndex
CREATE INDEX "complaints_userId_idx" ON "public"."complaints"("userId" ASC);

-- CreateIndex
CREATE INDEX "compliance_checks_associationId_idx" ON "public"."compliance_checks"("associationId" ASC);

-- CreateIndex
CREATE INDEX "compliance_checks_checkType_idx" ON "public"."compliance_checks"("checkType" ASC);

-- CreateIndex
CREATE INDEX "compliance_checks_checkedAt_idx" ON "public"."compliance_checks"("checkedAt" ASC);

-- CreateIndex
CREATE INDEX "compliance_checks_status_idx" ON "public"."compliance_checks"("status" ASC);

-- CreateIndex
CREATE INDEX "consent_receipts_associationId_idx" ON "public"."consent_receipts"("associationId" ASC);

-- CreateIndex
CREATE INDEX "consent_receipts_createdAt_idx" ON "public"."consent_receipts"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "consent_receipts_userId_purpose_idx" ON "public"."consent_receipts"("userId" ASC, "purpose" ASC);

-- CreateIndex
CREATE INDEX "contribution_periods_associationId_idx" ON "public"."contribution_periods"("associationId" ASC);

-- CreateIndex
CREATE INDEX "contribution_periods_status_idx" ON "public"."contribution_periods"("status" ASC);

-- CreateIndex
CREATE INDEX "contribution_periods_userId_idx" ON "public"."contribution_periods"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "contribution_periods_userId_year_month_key" ON "public"."contribution_periods"("userId" ASC, "year" ASC, "month" ASC);

-- CreateIndex
CREATE INDEX "document_references_fileId_idx" ON "public"."document_references"("fileId" ASC);

-- CreateIndex
CREATE INDEX "document_references_ledgerEntryId_idx" ON "public"."document_references"("ledgerEntryId" ASC);

-- CreateIndex
CREATE INDEX "document_references_paymentTransactionId_idx" ON "public"."document_references"("paymentTransactionId" ASC);

-- CreateIndex
CREATE INDEX "dsar_tickets_associationId_idx" ON "public"."dsar_tickets"("associationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "dsar_tickets_associationId_ticketNumber_key" ON "public"."dsar_tickets"("associationId" ASC, "ticketNumber" ASC);

-- CreateIndex
CREATE INDEX "dsar_tickets_responseDeadline_idx" ON "public"."dsar_tickets"("responseDeadline" ASC);

-- CreateIndex
CREATE INDEX "dsar_tickets_status_idx" ON "public"."dsar_tickets"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "dsar_tickets_ticketNumber_key" ON "public"."dsar_tickets"("ticketNumber" ASC);

-- CreateIndex
CREATE INDEX "dsar_tickets_userId_idx" ON "public"."dsar_tickets"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "eas_builds_rawEventId_key" ON "public"."eas_builds"("rawEventId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "eas_submissions_rawEventId_key" ON "public"."eas_submissions"("rawEventId" ASC);

-- CreateIndex
CREATE INDEX "files_associationId_idx" ON "public"."files"("associationId" ASC);

-- CreateIndex
CREATE INDEX "files_mimeType_idx" ON "public"."files"("mimeType" ASC);

-- CreateIndex
CREATE INDEX "ledger_entries_paymentTransactionId_idx" ON "public"."ledger_entries"("paymentTransactionId" ASC);

-- CreateIndex
CREATE INDEX "ledger_lines_ledgerEntryId_idx" ON "public"."ledger_lines"("ledgerEntryId" ASC);

-- CreateIndex
CREATE INDEX "meeting_attendees_meetingId_idx" ON "public"."meeting_attendees"("meetingId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "meeting_attendees_meetingId_userId_key" ON "public"."meeting_attendees"("meetingId" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "meeting_attendees_rsvpStatus_idx" ON "public"."meeting_attendees"("rsvpStatus" ASC);

-- CreateIndex
CREATE INDEX "meeting_attendees_userId_idx" ON "public"."meeting_attendees"("userId" ASC);

-- CreateIndex
CREATE INDEX "meetings_associationId_idx" ON "public"."meetings"("associationId" ASC);

-- CreateIndex
CREATE INDEX "meetings_scheduledAt_idx" ON "public"."meetings"("scheduledAt" ASC);

-- CreateIndex
CREATE INDEX "meetings_status_idx" ON "public"."meetings"("status" ASC);

-- CreateIndex
CREATE INDEX "meetings_type_idx" ON "public"."meetings"("type" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "member_types_associationId_level_key" ON "public"."member_types"("associationId" ASC, "level" ASC);

-- CreateIndex
CREATE INDEX "member_types_level_idx" ON "public"."member_types"("level" ASC);

-- CreateIndex
CREATE INDEX "membership_applications_associationSlug_idx" ON "public"."membership_applications"("associationSlug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_email_associationSlug_key" ON "public"."membership_applications"("email" ASC, "associationSlug" ASC);

-- CreateIndex
CREATE INDEX "membership_applications_email_idx" ON "public"."membership_applications"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "membership_applications_phone_associationSlug_key" ON "public"."membership_applications"("phone" ASC, "associationSlug" ASC);

-- CreateIndex
CREATE INDEX "membership_applications_phone_idx" ON "public"."membership_applications"("phone" ASC);

-- CreateIndex
CREATE INDEX "membership_applications_status_idx" ON "public"."membership_applications"("status" ASC);

-- CreateIndex
CREATE INDEX "notifications_associationId_idx" ON "public"."notifications"("associationId" ASC);

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "public"."notifications"("userId" ASC);

-- CreateIndex
CREATE INDEX "payment_allocations_contributionPeriodId_idx" ON "public"."payment_allocations"("contributionPeriodId" ASC);

-- CreateIndex
CREATE INDEX "payment_allocations_paymentTransactionId_idx" ON "public"."payment_allocations"("paymentTransactionId" ASC);

-- CreateIndex
CREATE INDEX "payment_providers_associationId_idx" ON "public"."payment_providers"("associationId" ASC);

-- CreateIndex
CREATE INDEX "payment_transactions_associationId_idx" ON "public"."payment_transactions"("associationId" ASC);

-- CreateIndex
CREATE INDEX "payment_transactions_paymentDate_idx" ON "public"."payment_transactions"("paymentDate" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_razorpayOrderId_key" ON "public"."payment_transactions"("razorpayOrderId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_razorpayPaymentId_key" ON "public"."payment_transactions"("razorpayPaymentId" ASC);

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "public"."payment_transactions"("status" ASC);

-- CreateIndex
CREATE INDEX "payment_transactions_userId_idx" ON "public"."payment_transactions"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_events_eventId_key" ON "public"."payment_webhook_events"("eventId" ASC);

-- CreateIndex
CREATE INDEX "payment_webhook_events_eventType_idx" ON "public"."payment_webhook_events"("eventType" ASC);

-- CreateIndex
CREATE INDEX "payment_webhook_events_processed_idx" ON "public"."payment_webhook_events"("processed" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "push_tokens_token_key" ON "public"."push_tokens"("token" ASC);

-- CreateIndex
CREATE INDEX "push_tokens_userId_idx" ON "public"."push_tokens"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "public"."refresh_tokens"("token" ASC);

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "public"."refresh_tokens"("userId" ASC);

-- CreateIndex
CREATE INDEX "subscription_billing_history_subscriptionId_idx" ON "public"."subscription_billing_history"("subscriptionId" ASC);

-- CreateIndex
CREATE INDEX "subscription_plan_versions_planId_idx" ON "public"."subscription_plan_versions"("planId" ASC);

-- CreateIndex
CREATE INDEX "subscription_plans_associationId_idx" ON "public"."subscription_plans"("associationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_associationId_name_key" ON "public"."subscription_plans"("associationId" ASC, "name" ASC);

-- CreateIndex
CREATE INDEX "subscriptions_endDate_idx" ON "public"."subscriptions"("endDate" ASC);

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "public"."subscriptions"("status" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "public"."subscriptions"("userId" ASC);

-- CreateIndex
CREATE INDEX "training_assignments_moduleId_idx" ON "public"."training_assignments"("moduleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "training_assignments_moduleId_userId_key" ON "public"."training_assignments"("moduleId" ASC, "userId" ASC);

-- CreateIndex
CREATE INDEX "training_assignments_status_idx" ON "public"."training_assignments"("status" ASC);

-- CreateIndex
CREATE INDEX "training_assignments_userId_idx" ON "public"."training_assignments"("userId" ASC);

-- CreateIndex
CREATE INDEX "training_certificate_templates_associationId_idx" ON "public"."training_certificate_templates"("associationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "training_certificate_templates_fileId_key" ON "public"."training_certificate_templates"("fileId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "training_certificates_certificateNumber_key" ON "public"."training_certificates"("certificateNumber" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "training_certificates_fileId_key" ON "public"."training_certificates"("fileId" ASC);

-- CreateIndex
CREATE INDEX "training_certificates_moduleId_idx" ON "public"."training_certificates"("moduleId" ASC);

-- CreateIndex
CREATE INDEX "training_certificates_userId_idx" ON "public"."training_certificates"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "training_certificates_userId_moduleId_key" ON "public"."training_certificates"("userId" ASC, "moduleId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "training_completions_userId_moduleId_key" ON "public"."training_completions"("userId" ASC, "moduleId" ASC);

-- CreateIndex
CREATE INDEX "training_modules_associationId_idx" ON "public"."training_modules"("associationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "training_modules_associationId_title_key" ON "public"."training_modules"("associationId" ASC, "title" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "training_modules_certificateTemplateId_key" ON "public"."training_modules"("certificateTemplateId" ASC);

-- CreateIndex
CREATE INDEX "training_supplements_moduleId_idx" ON "public"."training_supplements"("moduleId" ASC);

-- CreateIndex
CREATE INDEX "training_supplements_moduleId_isActive_idx" ON "public"."training_supplements"("moduleId" ASC, "isActive" ASC);

-- CreateIndex
CREATE INDEX "training_supplements_sortOrder_idx" ON "public"."training_supplements"("sortOrder" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_associationId_email_key" ON "public"."users"("associationId" ASC, "email" ASC);

-- CreateIndex
CREATE INDEX "users_associationId_idx" ON "public"."users"("associationId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_associationId_membershipNumber_key" ON "public"."users"("associationId" ASC, "membershipNumber" ASC);

-- CreateIndex
CREATE INDEX "users_dataRetentionUntil_idx" ON "public"."users"("dataRetentionUntil" ASC);

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE INDEX "users_passwordResetToken_idx" ON "public"."users"("passwordResetToken" ASC);

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role" ASC);

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status" ASC);

-- CreateIndex
CREATE INDEX "verification_codes_expiresAt_idx" ON "public"."verification_codes"("expiresAt" ASC);

-- CreateIndex
CREATE INDEX "verification_codes_userId_idx" ON "public"."verification_codes"("userId" ASC);

-- AddForeignKey
ALTER TABLE "public"."_ContributionPeriodToDeclarations" ADD CONSTRAINT "_ContributionPeriodToDeclarations_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."contribution_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ContributionPeriodToDeclarations" ADD CONSTRAINT "_ContributionPeriodToDeclarations_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."declarations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agenda_items" ADD CONSTRAINT "agenda_items_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcement_reads" ADD CONSTRAINT "announcement_reads_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "public"."announcements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcement_reads" ADD CONSTRAINT "announcement_reads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."announcements" ADD CONSTRAINT "announcements_imageFileId_fkey" FOREIGN KEY ("imageFileId") REFERENCES "public"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."complaints" ADD CONSTRAINT "complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."compliance_checks" ADD CONSTRAINT "compliance_checks_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consent_receipts" ADD CONSTRAINT "consent_receipts_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consent_receipts" ADD CONSTRAINT "consent_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."contribution_periods" ADD CONSTRAINT "contribution_periods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."declarations" ADD CONSTRAINT "declarations_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."declarations" ADD CONSTRAINT "declarations_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."declarations" ADD CONSTRAINT "declarations_reviewBy_fkey" FOREIGN KEY ("reviewBy") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_references" ADD CONSTRAINT "document_references_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_references" ADD CONSTRAINT "document_references_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "public"."ledger_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."document_references" ADD CONSTRAINT "document_references_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dsar_responses" ADD CONSTRAINT "dsar_responses_dsarTicketId_fkey" FOREIGN KEY ("dsarTicketId") REFERENCES "public"."dsar_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dsar_tickets" ADD CONSTRAINT "dsar_tickets_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dsar_tickets" ADD CONSTRAINT "dsar_tickets_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dsar_tickets" ADD CONSTRAINT "dsar_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eas_builds" ADD CONSTRAINT "eas_builds_rawEventId_fkey" FOREIGN KEY ("rawEventId") REFERENCES "public"."eas_webhook_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."eas_submissions" ADD CONSTRAINT "eas_submissions_rawEventId_fkey" FOREIGN KEY ("rawEventId") REFERENCES "public"."eas_webhook_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."files" ADD CONSTRAINT "files_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ledger_entries" ADD CONSTRAINT "ledger_entries_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ledger_lines" ADD CONSTRAINT "ledger_lines_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ledger_lines" ADD CONSTRAINT "ledger_lines_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ledger_lines" ADD CONSTRAINT "ledger_lines_ledgerEntryId_fkey" FOREIGN KEY ("ledgerEntryId") REFERENCES "public"."ledger_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meeting_attendees" ADD CONSTRAINT "meeting_attendees_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meeting_attendees" ADD CONSTRAINT "meeting_attendees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meeting_minutes" ADD CONSTRAINT "meeting_minutes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meetings" ADD CONSTRAINT "meetings_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."meetings" ADD CONSTRAINT "meetings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."member_types" ADD CONSTRAINT "member_types_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifications" ADD CONSTRAINT "notifications_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_allocations" ADD CONSTRAINT "payment_allocations_contributionPeriodId_fkey" FOREIGN KEY ("contributionPeriodId") REFERENCES "public"."contribution_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_allocations" ADD CONSTRAINT "payment_allocations_paymentTransactionId_fkey" FOREIGN KEY ("paymentTransactionId") REFERENCES "public"."payment_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_providers" ADD CONSTRAINT "payment_providers_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."payment_transactions" ADD CONSTRAINT "payment_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."push_tokens" ADD CONSTRAINT "push_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_billing_history" ADD CONSTRAINT "subscription_billing_history_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "public"."subscription_plan_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_billing_history" ADD CONSTRAINT "subscription_billing_history_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_plan_versions" ADD CONSTRAINT "subscription_plan_versions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_plans" ADD CONSTRAINT "subscription_plans_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_plans" ADD CONSTRAINT "subscription_plans_memberTypeId_fkey" FOREIGN KEY ("memberTypeId") REFERENCES "public"."member_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "public"."subscription_plan_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_assignments" ADD CONSTRAINT "training_assignments_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_assignments" ADD CONSTRAINT "training_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_certificate_templates" ADD CONSTRAINT "training_certificate_templates_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_certificates" ADD CONSTRAINT "training_certificates_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_certificates" ADD CONSTRAINT "training_certificates_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_certificates" ADD CONSTRAINT "training_certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_completions" ADD CONSTRAINT "training_completions_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_completions" ADD CONSTRAINT "training_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_modules" ADD CONSTRAINT "training_modules_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_modules" ADD CONSTRAINT "training_modules_certificateTemplateId_fkey" FOREIGN KEY ("certificateTemplateId") REFERENCES "public"."training_certificate_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_supplements" ADD CONSTRAINT "training_supplements_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "public"."files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."training_supplements" ADD CONSTRAINT "training_supplements_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."training_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "public"."associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_memberTypeId_fkey" FOREIGN KEY ("memberTypeId") REFERENCES "public"."member_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verification_codes" ADD CONSTRAINT "verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

