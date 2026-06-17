import { DeclarationStatus } from '@prisma/client';
import { pageNumberValidation } from '@validator';
import z from 'zod';

const remakeValidiation = z.string('Remark is required').min(3, 'Remark must atleast of 3 in char');

export const ApproveDeclarationSchema = z
  .object({
    remark: remakeValidiation,
  })
  .strict();

export type ApproveDeclarationInput = z.infer<typeof ApproveDeclarationSchema>;

export const RejectDeclarationSchema = ApproveDeclarationSchema;

export type RejectDeclarationInput = z.infer<typeof RejectDeclarationSchema>;

export const CreateUserDeclarations = z.object({
  amount: z
    .number('Amount is required')
    .int('Amount must be an integer')
    .min(1, 'Amount must be greater than 0')
    .max(10000, 'Amount must be less than 10000'),
});

export type CreateUserDeclarationsInput = z.infer<typeof CreateUserDeclarations>;

export const DeclarationParamsSchema = z.object({ id: z.string() });

const filterStatusEnum = [
  DeclarationStatus.PENDING,
  DeclarationStatus.APPROVED,
  DeclarationStatus.REJECTED,
  'ALL',
];
export const ListDeclarationsQuerySchema = z
  .object({
    page: pageNumberValidation,
    status: z.enum(filterStatusEnum).optional(),
  })
  .strict();

export type ListDeclarationsQueryInput = z.infer<typeof ListDeclarationsQuerySchema>;
