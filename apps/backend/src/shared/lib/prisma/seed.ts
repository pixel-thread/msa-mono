import { PrismaPg } from '@prisma/adapter-pg';
import type { AccountType} from '@prisma/client';
import { Prisma, PrismaClient, UserRole, UserStatus } from '@prisma/client';
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
];

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

  const plans = await Promise.all(
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

  const rolePlanMap: Partial<Record<UserRole, (typeof plans)[number]>> = {
    [UserRole.MEMBER]: plans[0],
    [UserRole.SUPER_ADMIN]: plans[0],
  };

  const roleMemberTypeMap: Partial<Record<UserRole, (typeof memberTypes)[number]>> = {
    [UserRole.MEMBER]: regular,
    [UserRole.SUPER_ADMIN]: regular,
  };

  const roles: UserRole[] = [UserRole.MEMBER, UserRole.SUPER_ADMIN];

  for (const role of roles) {
    const plan = rolePlanMap[role];
    const memberType = roleMemberTypeMap[role];

    await prisma.user.create({
      data: {
        associationId: association.id,
        email: buildUserEmail(role, data.short),
        name: buildUserName(role, data.short),
        mobile: '9999999999',
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

  console.log(`✓ ${data.name} seeded successfully`);
}

// -----------------------------------------------------------------------------
// MAIN
// -----------------------------------------------------------------------------

async function main() {
  console.log('\n--- Cleaning Database ---');

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
