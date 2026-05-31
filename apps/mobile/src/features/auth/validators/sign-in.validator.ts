import { z } from 'zod';
import { passwordValidation } from '@src/shared/validators/common';

export const SignInSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: passwordValidation,
});

export type SignInFormData = z.infer<typeof SignInSchema>;
