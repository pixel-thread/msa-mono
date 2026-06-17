import { PrismaPg } from '@prisma/adapter-pg';
import type { AccountType } from '@prisma/client';
import {
  AnnouncementPriority,
  AnnouncementStatus,
  AttendeeRole,
  AuditAction,
  ComplaintCategory,
  ComplaintStatus,
  ContributionStatus,
  DeclarationStatus,
  MeetingStatus,
  MeetingType,
  NotificationType,
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  PrismaClient,
  RsvpStatus,
  TrainingAssignmentStatus,
  UserRole,
  UserStatus,
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

// -----------------------------------------------------------------------------
// PRISMA
// -----------------------------------------------------------------------------

const createPrisma = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
  });
};

const prisma = createPrisma();

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

function buildUserEmail(role: UserRole, association: string) {
  return `${role.toLowerCase()}@${association}.org`;
}

function buildUserName(role: UserRole, association: string) {
  return `${association.toUpperCase()} ${role.replace(/_/g, ' ')}`;
}

function padNumber(n: number, width: number) {
  return String(n).padStart(width, '0');
}

const BULK_COUNT = 500;

// -----------------------------------------------------------------------------
// SEED CONFIG
// -----------------------------------------------------------------------------

const ASSOCIATIONS = [
  {
    slug: 'mfsa',
    short: 'mfsa',
    name: 'Meghalaya Finance Service Association',
    primaryColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
  },
  {
    slug: 'mpsa',
    short: 'mpsa',
    name: 'Meghalaya Police Service Association',
    primaryColor: '#1e3a8a',
    secondaryColor: '#3b82f6',
  },
];

// -----------------------------------------------------------------------------
// BULK TEST DATA (1000+ records per entity for pagination testing)
// -----------------------------------------------------------------------------

async function seedBulkTestData(associationId: string, users: { id: string }[]) {
  console.log('  ── Bulk test data ──');

  // -------------------------------------------------------------------------
  // TRAINING MODULES + ASSIGNMENTS + COMPLETIONS
  // -------------------------------------------------------------------------

  const moduleData = Array.from({ length: BULK_COUNT }, (_, i) => ({
    associationId,
    title: `Training Module ${padNumber(i + 1, 3)}`,
    content: `Content for training module ${i + 1}.`,
    description: `Bulk training module for pagination — #${i + 1}.`,
    durationMinutes: 30 + (i % 120),
    requiredForRoles: [UserRole.MEMBER],
    isActive: true,
  }));

  await prisma.trainingModule.createMany({ data: moduleData });

  const modules = await prisma.trainingModule.findMany({
    where: { associationId },
    select: { id: true },
  });

  const superAdminId = users[users.length - 1]?.id ?? users[0].id;

  const assignmentData = modules.flatMap((m) =>
    users.map((u) => ({
      moduleId: m.id,
      userId: u.id,
      status: TrainingAssignmentStatus.ASSIGNED,
      assignedById: superAdminId,
      assignedAt: new Date('2025-01-01'),
      dueDate: new Date('2025-12-31'),
    })),
  );

  for (let i = 0; i < assignmentData.length; i += 100) {
    await prisma.trainingAssignment.createMany({ data: assignmentData.slice(i, i + 100) });
  }

  const completionData = modules.flatMap((m, modIndex) =>
    users
      .filter((_, userIndex) => (modIndex + userIndex) % 3 !== 0)
      .map((u) => ({
        moduleId: m.id,
        userId: u.id,
        scorePercent: new Prisma.Decimal(70 + Math.floor(Math.random() * 31)),
        completedAt: new Date('2025-06-01'),
      })),
  );

  for (let i = 0; i < completionData.length; i += 100) {
    await prisma.trainingCompletion.createMany({ data: completionData.slice(i, i + 100) });
  }

  console.log(
    `  ✓ Training: ${modules.length} modules, ${assignmentData.length} assignments, ${completionData.length} completions`,
  );

  // -------------------------------------------------------------------------
  // MEETINGS + ATTENDEES
  // -------------------------------------------------------------------------

  const meetingData = Array.from({ length: BULK_COUNT }, (_, i) => ({
    associationId,
    title: `Meeting ${padNumber(i + 1, 3)}`,
    type: i % 2 === 0 ? MeetingType.EC_MEETING : MeetingType.GENERAL_MEETING,
    status: MeetingStatus.SCHEDULED,
    scheduledAt: new Date(2025, 0, ((i + 1) % 365) + 1),
    venue: i % 3 === 0 ? 'Conference Room A' : i % 3 === 1 ? 'Main Hall' : 'Online',
    createdById: superAdminId,
  }));

  await prisma.meeting.createMany({ data: meetingData });

  const meetings = await prisma.meeting.findMany({
    where: { associationId },
    select: { id: true },
  });

  const attendeeData = meetings.flatMap((m) =>
    users.map((u) => ({
      meetingId: m.id,
      userId: u.id,
      attendeeRole: u.id === superAdminId ? AttendeeRole.HOST : AttendeeRole.REQUIRED,
      rsvpStatus: RsvpStatus.ACCEPTED,
      rsvpAt: new Date('2025-01-15'),
    })),
  );

  for (let i = 0; i < attendeeData.length; i += 100) {
    await prisma.meetingAttendee.createMany({ data: attendeeData.slice(i, i + 100) });
  }

  console.log(`  ✓ Meetings: ${meetings.length} meetings, ${attendeeData.length} attendees`);

  // -------------------------------------------------------------------------
  // CONTRIBUTION PERIODS (2 users × 500 periods = 1000)
  // -------------------------------------------------------------------------

  const periodData = users.flatMap((u) =>
    Array.from({ length: BULK_COUNT }, (_, i) => {
      const totalMonths = i;
      const year = 2025 + Math.floor(totalMonths / 12);
      const month = (totalMonths % 12) + 1;
      return {
        associationId,
        userId: u.id,
        year,
        month,
        expectedAmount: new Prisma.Decimal(300),
        paidAmount: new Prisma.Decimal(0),
        dueAmount: new Prisma.Decimal(300),
        status: ContributionStatus.DUE,
        dueDate: new Date(year, month, 15),
      };
    }),
  );

  await prisma.contributionPeriod.createMany({ data: periodData });

  console.log(`  ✓ Contribution periods: ${periodData.length}`);

  // -------------------------------------------------------------------------
  // PAYMENT TRANSACTIONS
  // -------------------------------------------------------------------------

  const paymentStatuses: PaymentStatus[] = [
    PaymentStatus.COMPLETED,
    PaymentStatus.PENDING,
    PaymentStatus.FAILED,
  ];

  const paymentMethods: PaymentMethod[] = [
    PaymentMethod.CASH,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.UPI,
    PaymentMethod.ONLINE,
  ];

  const paymentData = Array.from({ length: BULK_COUNT * 2 }, (_, i) => ({
    associationId,
    userId: users[i % users.length].id,
    amount: new Prisma.Decimal(100 + Math.floor(Math.random() * 900)),
    currency: 'INR',
    gateway: PaymentGateway.MANUAL,
    status: paymentStatuses[i % paymentStatuses.length],
    method: paymentMethods[i % paymentMethods.length],
    paymentDate: new Date(2025, 0, ((i + 1) % 365) + 1),
    notes: `Bulk payment transaction #${i + 1}`,
  }));

  await prisma.paymentTransaction.createMany({ data: paymentData });

  console.log(`  ✓ Payment transactions: ${paymentData.length}`);

  // -------------------------------------------------------------------------
  // LEDGER ENTRIES + LINES
  // -------------------------------------------------------------------------

  const accounts = await prisma.account.findMany({
    where: { associationId },
    select: { id: true, code: true, type: true },
  });

  const assetAccount = accounts.find((a) => a.code === '1000');
  const incomeAccount = accounts.find((a) => a.code === '4000');
  const expenseAccount = accounts.find((a) => a.code === '5000');

  const ledgerData = Array.from({ length: BULK_COUNT * 2 }, (_, i) => ({
    description: `Bulk ledger entry #${i + 1}`,
    approvalStatus: i % 4 === 0 ? ('APPROVED' as const) : ('PENDING' as const),
    createdById: users[i % users.length].id,
  }));

  for (let i = 0; i < ledgerData.length; i += 100) {
    const chunk = ledgerData.slice(i, i + 100);
    await prisma.ledgerEntry.createMany({ data: chunk });
  }

  const allEntries = await prisma.ledgerEntry.findMany({
    where: { createdById: { in: users.map((u) => u.id) } },
    select: { id: true },
  });

  const lineData = allEntries.flatMap((e, i) => {
    const amount = new Prisma.Decimal(100 + Math.floor(Math.random() * 500));
    const debitAccount = assetAccount ?? accounts[0];
    const creditAccount = incomeAccount ?? expenseAccount ?? accounts[1];
    if (!debitAccount || !creditAccount) return [];
    return [
      { ledgerEntryId: e.id, associationId, accountId: debitAccount.id, isDebit: true, amount },
      { ledgerEntryId: e.id, associationId, accountId: creditAccount.id, isDebit: false, amount },
    ];
  });

  if (lineData.length > 0) {
    await prisma.ledgerLine.createMany({ data: lineData });
  }

  console.log(`  ✓ Ledger: ${allEntries.length} entries, ${lineData.length} lines`);

  // -------------------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------------------

  const notificationData = Array.from({ length: BULK_COUNT * 2 }, (_, i) => ({
    userId: users[i % users.length].id,
    associationId,
    title: `Notification ${padNumber(i + 1, 3)}`,
    type: NotificationType.SYSTEM,
    body: `This is notification body #${i + 1} for pagination testing.`,
    route: '/notifications',
    entityId: `entity-${i + 1}`,
    isRead: i % 2 === 0,
  }));

  await prisma.notification.createMany({ data: notificationData });

  console.log(`  ✓ Notifications: ${notificationData.length}`);

  // -------------------------------------------------------------------------
  // AUDIT LOGS
  // -------------------------------------------------------------------------

  const auditActions: AuditAction[] = [
    AuditAction.CREATE,
    AuditAction.UPDATE,
    AuditAction.DELETE,
    AuditAction.LOGIN,
    AuditAction.PAYMENT_CREATED,
    AuditAction.PAYMENT_COMPLETED,
  ];

  const resourceTypes = ['User', 'Payment', 'Meeting', 'Training', 'Contribution'];

  const auditData = Array.from({ length: BULK_COUNT * 2 }, (_, i) => ({
    associationId,
    actorId: users[i % users.length].id,
    action: auditActions[i % auditActions.length],
    resourceType: resourceTypes[i % resourceTypes.length],
    resourceId: `resource-${i + 1}`,
    ipAddress: '192.168.1.1',
    createdAt: new Date(2025, 0, ((i + 1) % 365) + 1),
  }));

  await prisma.auditLog.createMany({ data: auditData });

  console.log(`  ✓ Audit logs: ${auditData.length}`);

  // -------------------------------------------------------------------------
  // COMPLAINTS
  // -------------------------------------------------------------------------

  const categories: ComplaintCategory[] = [
    ComplaintCategory.MEETING_CONDUCT,
    ComplaintCategory.PAYMENT_DISPUTE,
    ComplaintCategory.ADMINISTRATIVE,
    ComplaintCategory.MEMBER_CONDUCT,
  ];

  const complaintStatuses: ComplaintStatus[] = [
    ComplaintStatus.OPEN,
    ComplaintStatus.IN_PROGRESS,
    ComplaintStatus.RESOLVED,
    ComplaintStatus.CLOSED,
  ];

  const complaintData = Array.from({ length: BULK_COUNT * 2 }, (_, i) => ({
    associationId,
    userId: users[i % users.length].id,
    category: categories[i % categories.length],
    subject: `Complaint ${padNumber(i + 1, 3)}`,
    description: `Description for complaint #${i + 1} for pagination testing.`,
    status: complaintStatuses[i % complaintStatuses.length],
    priority: i % 3 === 0 ? 'HIGH' : i % 3 === 1 ? 'NORMAL' : 'LOW',
  }));

  await prisma.complaint.createMany({ data: complaintData });

  console.log(`  ✓ Complaints: ${complaintData.length}`);

  // -------------------------------------------------------------------------
  // ANNOUNCEMENTS + READS
  // -------------------------------------------------------------------------

  const announcementData = Array.from({ length: BULK_COUNT }, (_, i) => ({
    associationId,
    authorId: users[i % users.length].id,
    title: `Announcement ${padNumber(i + 1, 3)}`,
    content: `Content for announcement #${i + 1}. This is a bulk announcement for pagination testing purposes.`,
    summary: `Summary of announcement #${i + 1}`,
    status: AnnouncementStatus.PUBLISHED,
    priority: i % 4 === 0 ? AnnouncementPriority.URGENT : AnnouncementPriority.NORMAL,
    publishedAt: new Date(2025, 0, ((i + 1) % 365) + 1),
    targetRoles: [UserRole.MEMBER],
  }));

  for (let i = 0; i < announcementData.length; i += 100) {
    const chunk = announcementData.slice(i, i + 100);
    await prisma.announcement.createMany({ data: chunk });
  }

  const announcements = await prisma.announcement.findMany({
    where: { associationId },
    select: { id: true },
  });

  const readData = announcements.flatMap((a) =>
    users.map((u) => ({
      announcementId: a.id,
      userId: u.id,
      readAt: new Date(2025, 0, Math.floor(Math.random() * 365) + 1),
    })),
  );

  for (let i = 0; i < readData.length; i += 100) {
    const chunk = readData.slice(i, i + 100);
    await prisma.announcementRead.createMany({ data: chunk });
  }

  console.log(`  ✓ Announcements: ${announcements.length}, reads: ${readData.length}`);

  // -------------------------------------------------------------------------
  // DECLARATIONS
  // -------------------------------------------------------------------------

  const declarationData = Array.from({ length: BULK_COUNT * 2 }, (_, i) => ({
    memberId: users[i % users.length].id,
    associationId,
    declerationStartDate: new Date(2025, 0, 1),
    declerationEndDate: new Date(2025, 11, 31),
    amount: new Prisma.Decimal(100 + Math.floor(Math.random() * 900)),
    status: i % 3 === 0 ? DeclarationStatus.PENDING : DeclarationStatus.APPROVED,
  }));

  await prisma.declarations.createMany({ data: declarationData });

  console.log(`  ✓ Declarations: ${declarationData.length}`);
}

// -----------------------------------------------------------------------------
// SEED ASSOCIATION
// -----------------------------------------------------------------------------

async function seedAssociation(data: (typeof ASSOCIATIONS)[number]) {
  console.log(`\n--- Seeding ${data.name} ---`);

  const password = await hashPassword(process.env.PASSWORD!);

  // ---------------------------------------------------------------------------
  // ASSOCIATION
  // ---------------------------------------------------------------------------

  const association = await prisma.association.create({
    data: {
      slug: data.slug,
      name: data.name,
      description: `${data.name} official association portal`,
      state: 'Meghalaya',
      country: 'IN',
      timezone: 'Asia/Kolkata',
      currencyCode: 'INR',
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      contactEmail: `contact@${data.short}.org`,
      contactPhone: '9876543210',
    },
  });

  // ---------------------------------------------------------------------------
  // MEMBER TYPES
  // ---------------------------------------------------------------------------

  const memberTypes = await Promise.all(
    [{ description: 'Regular', level: 1 }].map((mt) =>
      prisma.memberType.create({
        data: { associationId: association.id, ...mt },
      }),
    ),
  );

  const [regular] = memberTypes;

  // ---------------------------------------------------------------------------
  // SUBSCRIPTION PLANS
  // ---------------------------------------------------------------------------

  const planConfigs = [
    {
      name: 'Super Admin Plan',
      memberTypeId: regular.id,
      amount: 300,
      isDefault: true,
    },
  ];

  await Promise.all(
    planConfigs.map((cfg) =>
      prisma.plan.create({
        data: {
          associationId: association.id,
          name: cfg.name,
          memberTypeId: cfg.memberTypeId,
          isDefault: cfg.isDefault ?? false,
          versions: {
            create: {
              amount: new Prisma.Decimal(cfg.amount),
              currency: 'INR',
              billingCycle: 'MONTHLY',
              description: cfg.name,
              effectiveFrom: new Date('2025-01-01'),
            },
          },
        },
        include: { versions: { take: 1 } },
      }),
    ),
  );

  // ---------------------------------------------------------------------------
  // USERS
  // ---------------------------------------------------------------------------

  const roleMemberTypeMap: Partial<Record<UserRole, (typeof memberTypes)[number]>> = {
    [UserRole.MEMBER]: regular,
    [UserRole.SUPER_ADMIN]: regular,
    [UserRole.DPO]: regular,
  };

  const roles: UserRole[] = [UserRole.MEMBER, UserRole.SUPER_ADMIN];

  for (const role of roles) {
    const memberType = roleMemberTypeMap[role];

    await prisma.user.create({
      data: {
        associationId: association.id,
        email: buildUserEmail(role, data.short),
        name: buildUserName(role, data.short),
        mobile: '9999999999',
        firstName: buildUserName(role, data.short),
        designation: role,
        role: [role],
        password,
        status: UserStatus.ACTIVE,
        membershipNumber: `${data.short.toUpperCase()}-${role}`,
        imageUrl: 'https://placehold.co/300x300',
        mfaEnabled: false,
        memberTypeId: memberType?.id,
        dateOfJoiningGovt: new Date('2025-01-01'),
        dateOfJoiningAssociation: new Date('2025-01-01'),
      },
    });

    type Account = {
      code: string;
      name: string;
      type: AccountType;
    };

    const accounts: Account[] = [
      { code: '1000', name: 'Bank Account', type: 'ASSET' },
      { code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
      { code: '1200', name: 'Cash on Hand', type: 'ASSET' },
      { code: '2000', name: 'Unearned Revenue', type: 'LIABILITY' },
      { code: '2100', name: 'Member Deposits', type: 'LIABILITY' },
      { code: '3000', name: 'Retained Earnings', type: 'EQUITY' },
      { code: '4000', name: 'Subscription Income', type: 'INCOME' },
      { code: '4100', name: 'Event Fee Income', type: 'INCOME' },
      { code: '4200', name: 'Donation Income', type: 'INCOME' },
      { code: '4300', name: 'Bank Interest', type: 'INCOME' },
      { code: '5000', name: 'Office Expense', type: 'EXPENSE' },
      { code: '5100', name: 'Waiver Expense', type: 'EXPENSE' },
      { code: '5200', name: 'Refund Expense', type: 'EXPENSE' },
    ];
    const associationId = association.id;

    await prisma.account.createMany({
      data: accounts.map((a) => ({ ...a, associationId, isActive: true })),
      skipDuplicates: true,
    });
  }

  // ---------------------------------------------------------------------------
  // BULK TEST DATA
  // ---------------------------------------------------------------------------

  const users = await prisma.user.findMany({
    where: { associationId: association.id },
    select: { id: true },
  });

  await seedBulkTestData(association.id, users);

  console.log(`✓ ${data.name} seeded successfully`);
}

// -----------------------------------------------------------------------------
// MAIN
// -----------------------------------------------------------------------------

async function main() {
  console.log('\n--- Cleaning Database ---');

  await prisma.trainingCompletion.deleteMany();
  await prisma.trainingAssignment.deleteMany();
  await prisma.trainingCertificate.deleteMany();
  await prisma.trainingSupplement.deleteMany();
  await prisma.meetingAttendee.deleteMany();
  await prisma.agendaItem.deleteMany();
  await prisma.meetingMinutes.deleteMany();
  await prisma.announcementRead.deleteMany();
  await prisma.paymentAllocation.deleteMany();
  await prisma.paymentWebhookEvent.deleteMany();
  await prisma.dsarResponse.deleteMany();
  await prisma.retroactiveAffectedUser.deleteMany();
  await prisma.ledgerLine.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.declarations.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.meeting.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.trainingModule.deleteMany();
  await prisma.trainingCertificateTemplate.deleteMany();
  await prisma.contributionPeriod.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.planVersion.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();
  await prisma.memberType.deleteMany();
  await prisma.association.deleteMany();

  for (const association of ASSOCIATIONS) {
    await seedAssociation(association);
  }

  console.log('\n✓ Database Seed Completed Successfully');
}

// -----------------------------------------------------------------------------
// RUN
// -----------------------------------------------------------------------------

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
