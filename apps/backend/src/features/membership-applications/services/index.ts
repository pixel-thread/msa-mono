// ---- Membership Applications - Services

// ---- Imports

// ---- External Libraries

import { BadRequestError, ConflictError, NotFoundError } from '@errors';
import { generateRandomPassword, hashPassword } from '@lib/password';
// ---- Shared Utilities
import { prisma } from '@lib/prisma';
import type { Prisma } from '@prisma/client';
import { ApplicationStatus, UserRole } from '@prisma/client';
import { updateUser } from '@src/features/user/services';
import { PAGE_SIZE } from '@src/shared/constants';
import { findUniqueUser } from '@src/shared/services';
import { buildPagination } from '@src/shared/utils/helper/build-pagination';

// ---- Types (Private)

/** Parameters for creating a membership application. */
type CreateApplicationProps = {
  email: string;
  phone: string;
  associationSlug: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth: Date;
  age: number;
  gender: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
};

/** Parameters for retrieving membership applications. */
type GetApplicationsProps = {
  where?: Prisma.MembershipApplicationWhereInput;
  page?: number;
};

/** Parameters for approving a membership application. */
type ApproveApplicationProps = {
  applicationId: string;
  memberTypeId?: string | null;
  role?: UserRole;
  dateOfJoiningGovt?: Date;
  associationId: string;
  reviewedBy: string;
};

/** Parameters for rejecting a membership application. */
type RejectApplicationProps = {
  applicationId: string;
  rejectionReason: string;
  reviewedBy: string;
};

// ---- Create Membership Application

/**
 * Create a new membership application with duplicate email/phone checks.
 *
 * Business logic:
 * - Checks for existing applications with the same email or phone within the same association
 * - Throws ConflictError if a duplicate is found
 */
export async function createMembershipApplication(data: CreateApplicationProps) {
  const existing = await prisma.membershipApplication.findFirst({
    where: {
      OR: [
        {
          email: data.email,
          associationSlug: data.associationSlug,
        },
        {
          phone: data.phone,
          associationSlug: data.associationSlug,
        },
      ],
    },
  });

  if (existing) {
    if (existing.email === data.email) {
      throw new ConflictError('An application with this email already exists for this association');
    }
    throw new ConflictError(
      'An application with this phone number already exists for this association',
    );
  }

  return prisma.membershipApplication.create({
    data: {
      email: data.email,
      phone: data.phone,
      associationSlug: data.associationSlug,
      firstName: data.firstName,
      lastName: data.lastName ?? '',
      middleName: data.middleName ?? '',
      dateOfBirth: new Date(data.dateOfBirth),
      age: data.age,
      gender: data.gender,
      address: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postalCode,
    },
  });
}

// ---- Get Membership Applications (Paginated)

/**
 * Retrieve paginated membership applications with optional filters.
 */
export async function getMembershipApplications({ where = {}, page = 1 }: GetApplicationsProps) {
  const pageSize = PAGE_SIZE;
  const skip = (page - 1) * pageSize;

  const [applications, total] = await Promise.all([
    prisma.membershipApplication.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.membershipApplication.count({ where }),
  ]);

  return {
    data: applications,
    pagination: buildPagination(total, page),
  };
}

// ---- Get Single Membership Application

/**
 * Find a single membership application by unique criteria.
 */
export async function getMembershipApplication(
  where: Prisma.MembershipApplicationWhereUniqueInput,
) {
  return prisma.membershipApplication.findUnique({ where });
}

// ---- Approve Membership Application

/**
 * Approve a membership application, create a user account, and return temp credentials.
 *
 * Business logic:
 * - Verifies the application exists, is not already approved/rejected
 * - Finds the association by slug
 * - Checks for existing user with same email in the association
 * - Generates a random password and hashes it
 * - Creates the user account and updates the application status to APPROVED
 */
export async function approveMembershipApplication({
  applicationId,
  memberTypeId,
  role = UserRole.MEMBER,
  associationId,
  dateOfJoiningGovt,
  reviewedBy,
}: ApproveApplicationProps) {
  const association = await prisma.association.findUnique({
    where: { id: associationId },
    select: { slug: true, id: true },
  });

  const application = await prisma.membershipApplication.findUnique({
    where: { id: applicationId, associationSlug: association?.slug },
  });

  if (!application) {
    throw new NotFoundError('Membership application not found');
  }

  if (application.status === ApplicationStatus.APPROVED) {
    throw new ConflictError('Application has already been approved');
  }

  if (application.status === ApplicationStatus.REJECTED) {
    throw new ConflictError('Application has been rejected and cannot be approved');
  }

  if (!association) {
    throw new NotFoundError('Association not found');
  }

  const randomPassword = generateRandomPassword();

  const hashedPassword = await hashPassword(randomPassword);

  const existingUser = await findUniqueUser({
    where: { email: application.email },
  });

  if (existingUser) {
    const { user, updatedApplication } = await prisma.$transaction(async (tx) => {
      const updatedApplication = await tx.membershipApplication.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedBy,
        },
      });
      const transferedUser = await updateUser({
        where: { id: existingUser.id },
        data: {
          role: [UserRole.MEMBER],
          dateOfJoiningAssociation: new Date(),
          dateOfJoiningGovt,
          failedLoginAttempts: 0,
          memberType: { connect: { id: memberTypeId || '' } },
          association: { connect: { id: association.id } },
          lockedUntil: null,
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      return { updatedApplication, user: transferedUser };
    });
    return { user, application: updatedApplication };
  }

  if (!application.firstName || application.firstName === null)
    throw new BadRequestError('First name is required');

  const { user, updatedApplication } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: application.email,
        name: `${application.firstName} ${application.middleName} ${application.lastName}`,
        firstName: application.firstName,
        middleName: application.middleName,
        lastName: application.lastName,
        mobile: application.phone,
        associationId: association.id,
        role: [role],
        status: 'ACTIVE',
        memberTypeId: memberTypeId || null,
        dateOfJoiningGovt: dateOfJoiningGovt || new Date(),
        dateOfJoiningAssociation: new Date(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        middleName: true,
        lastName: true,
        role: true,
        status: true,
      },
    });

    const updatedApplication = await tx.membershipApplication.update({
      where: { id: applicationId },
      data: {
        status: ApplicationStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedBy,
      },
    });
    return { user, updatedApplication };
  });

  return {
    user,
    application: updatedApplication,
  };
}

// ---- Reject Membership Application

/**
 * Reject a pending membership application with a reason.
 *
 * Business logic:
 * - Verifies the application exists and is in PENDING status
 * - Only pending applications can be rejected
 */
export async function rejectMembershipApplication({
  applicationId,
  rejectionReason,
  reviewedBy,
}: RejectApplicationProps) {
  const application = await prisma.membershipApplication.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new NotFoundError('Membership application not found');
  }

  if (application.status !== ApplicationStatus.PENDING) {
    throw new ConflictError('Application can only be rejected if it is pending');
  }

  return prisma.membershipApplication.update({
    where: { id: applicationId },
    data: {
      status: ApplicationStatus.REJECTED,
      rejectionReason,
      reviewedAt: new Date(),
      reviewedBy,
    },
  });
}
