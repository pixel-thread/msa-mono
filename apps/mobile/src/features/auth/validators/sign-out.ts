import { z } from 'zod';

export const SignOutSchema = z.object({
  token: z.string().min(6, 'Token must be at least 6 characters'),
});
