import { PrismaPg } from '@prisma/adapter-pg';
import {
  Prisma,
  PrismaClient,
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
  // SUBSCRIPTION PLAN
  // ---------------------------------------------------------------------------

  const subscriptionPlan = await prisma.subscriptionPlan.create({
    data: {
      associationId: association.id,
      name: 'Standard Membership',
      description: 'Default membership plan',
      versions: {
        create: {
          amount: new Prisma.Decimal(50),
          currency: 'INR',
          billingCycle: 'MONTHLY',
          features: {
            voting: true,
            newsletter: true,
            events: true,
          },
          description: 'Default membership plan',
        },
      },
    },
    include: {
      versions: {
        take: 1,
      },
    },
  });

  // ---------------------------------------------------------------------------
  // USERS
  // ---------------------------------------------------------------------------

  const roles = [
    UserRole.SUPER_ADMIN,
    UserRole.PRESIDENT,
    UserRole.SECRETARY,
    UserRole.FINANCE,
    UserRole.DPO,
    UserRole.MEMBER,
  ];

  for (const role of roles) {
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
        dateOfJoiningGovt: new Date('2025-01-01'),
        dateOfJoiningAssociation: new Date('2025-01-01'),
        subscription: {
          create: {
            planId: subscriptionPlan.id,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-01-01'),
            planVersionId: subscriptionPlan.versions[0].id,
          },
        },
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

  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.user.deleteMany();
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
