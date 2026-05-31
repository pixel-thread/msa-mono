import { passwordValidation } from '@src/shared/validators';
import { z } from 'zod';

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(6, 'Token must be at least 6 characters'),
    password: passwordValidation,
    confirmPassword: passwordValidation,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

