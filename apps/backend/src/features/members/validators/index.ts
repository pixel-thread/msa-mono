import { UserRole, UserStatus } from '@prisma/client';
import { pageNumberValidation } from '@src/shared/validators';
import { z } from 'zod';

export const MemberQuerySchema = z
  .object({
    page: pageNumberValidation,
    status: z.enum(UserStatus).optional(),
    search: z.string().optional(),
  })
  .strict();

export const MembersParamSchema = z.object({ memberId: z.uuid() }).strict();
export type MembersParamInput = z.infer<typeof MembersParamSchema>;

export const MemberAdminOnboardingSchema = z
  .object({
    name: z.string().min(1, 'Name is required').optional(),
    mobile: z
      .string()
      .min(10, 'Mobile must be 10 digits')
      .max(10, 'Mobile must be 10 digits')
      .regex(/^[0-9]+$/, 'Mobile should contain only numbers')
      .optional(),
    designation: z.string().optional(),
    dateOfJoiningGovt: z.coerce.date().optional(),
    dateOfJoiningAssociation: z.coerce.date().optional(),
    membershipNumber: z.string().optional(),
    associationId: z.uuid(),
  })
  .strict();

export type MemberAdminOnboardingInput = z.infer<typeof MemberAdminOnboardingSchema>;

export const UpdateMembersStatusSchema = z
  .object({
    status: z.enum(UserStatus),
  })
  .strict();

export type UpdateMembersStatusInput = z.infer<typeof UpdateMembersStatusSchema>;

export const UpdateMemberRoleSchema = z
  .object({
    role: z.enum(UserRole),
  })
  .strict();

export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

export const UpdateMemberTypeSchema = z
  .object({
    memberTypeId: z.uuid('Member type is required'),
  })
  .strict();

export type UpdateMemberTypeInput = z.infer<typeof UpdateMemberTypeSchema>;

export const MemberOnboardingSchema = z
  .object({
    dateOfJoiningGovt: z.coerce
      .date()
      .refine((d) => new Date(d) < new Date(), 'Cannot be in the future'),
    dateOfJoiningAssociation: z.coerce
      .date()
      .refine((d) => new Date(d) < new Date(), 'Cannot be in the future'),
    mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid Indian mobile number required'),
    designation: z.string().min(2).max(100).trim(),
  })
  .strict();
export type MemberOnboardingInput = z.infer<typeof MemberOnboardingSchema>;
