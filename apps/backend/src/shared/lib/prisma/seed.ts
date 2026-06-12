import { PrismaPg } from '@prisma/adapter-pg';
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
    [
      { description: 'Regular', level: 1 },
      { description: 'Executive', level: 2 },
      { description: 'Honorary', level: 3 },
    ].map((mt) =>
      prisma.memberType.create({
        data: { associationId: association.id, ...mt },
      }),
    ),
  );

  const [regular, executive, honorary] = memberTypes;

  // ---------------------------------------------------------------------------
  // SUBSCRIPTION PLANS
  // ---------------------------------------------------------------------------

  const planConfigs = [
    {
      name: 'Basic Membership',
      memberTypeId: regular.id,
      amount: 50,
      isDefault: true,
    },
    {
      name: 'Executive Membership',
      memberTypeId: executive.id,
      amount: 150,
    },
    {
      name: 'Premium Membership',
      memberTypeId: honorary.id,
      amount: 300,
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
              features: { voting: true, newsletter: true, events: true },
              description: cfg.name,
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

  const rolePlanMap: Record<UserRole, (typeof plans)[number]> = {
    [UserRole.MEMBER]: plans[0],
    [UserRole.DPO]: plans[0],
    [UserRole.SECRETARY]: plans[1],
    [UserRole.FINANCE]: plans[1],
    [UserRole.PRESIDENT]: plans[2],
    [UserRole.SUPER_ADMIN]: plans[2],
  };

  const roleMemberTypeMap: Record<UserRole, (typeof memberTypes)[number]> = {
    [UserRole.MEMBER]: regular,
    [UserRole.DPO]: regular,
    [UserRole.SECRETARY]: executive,
    [UserRole.FINANCE]: executive,
    [UserRole.PRESIDENT]: honorary,
    [UserRole.SUPER_ADMIN]: honorary,
  };

  const roles = Object.values(UserRole);

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
        memberTypeId: memberType.id,
        dateOfJoiningGovt: new Date('2025-01-01'),
      },
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
