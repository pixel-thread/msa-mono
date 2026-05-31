import { z } from 'zod';

export const SignInVerifySchema = z.object({
  code: z
    .string({ message: 'Verification code is required' })
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d+$/, 'Verification code must contain only numbers'),
  mfa_temp_token: z.string().optional(),
});

export type SignInVerifyFormData = z.infer<typeof SignInVerifySchema>;
