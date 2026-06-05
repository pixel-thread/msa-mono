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
