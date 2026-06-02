import { ApplicationStatus, UserRole } from '@src/shared/types/enums';
import {
  pageNumberValidation,
  pageSizeValidation,
  uuidValidiation,
} from '@src/shared/validators/common';
import z from 'zod';
import {
  MembershipApplicationSchema,
  type MembershipApplicationInput,
} from '@src/shared/validators/membership-application.validator';

export { MembershipApplicationSchema, type MembershipApplicationInput };

export const GetMembershipApplicationsQuerySchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  page: pageNumberValidation,
  pageSize: pageSizeValidation,
});

export type GetMembershipApplicationsQuery = z.infer<typeof GetMembershipApplicationsQuerySchema>;

export const MembershipApplicationParamsSchema = z.object({
  applicationId: uuidValidiation,
});

export const ApproveApplicationSchema = z
  .object({
    memberTypeId: z.uuid('Invalid member type'),
    role: z.nativeEnum(UserRole).default('MEMBER').optional(),
    dateOfJoiningGovt: z.coerce.date('Invalid date').default(new Date()).optional(),
  })
  .strict();

export type ApproveApplicationInput = z.infer<typeof ApproveApplicationSchema>;

export const RejectApplicationSchema = z
  .object({
    rejectionReason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
  })
  .strict();

export type RejectApplicationInput = z.infer<typeof RejectApplicationSchema>;
