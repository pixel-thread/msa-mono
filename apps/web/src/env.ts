import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url('Invalid NEXT_PUBLIC_APP_URL'),
  NEXT_PUBLIC_ASSOCIATION_SLUG: z
    .string('INVALID NEXT_PUBLIC_ASSOCIATION_SLUG')
    .min(2)
    .max(10)
    .default('mfsa'),
  NEXT_PUBLIC_API_BASE_URL: z.url('Invalid NEXT_PUBLIC_API_BASE_URL'),
  NEXT_PUBLIC_NODE_ENV: z.enum(
    ['development', 'test', 'production'],
    'Invalid NEXT_PUBLIC_NODE_ENV',
  ),
});

function createEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: import.meta.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ASSOCIATION_SLUG: import.meta.env.NEXT_PUBLIC_ASSOCIATION_SLUG,
    NEXT_PUBLIC_API_BASE_URL: import.meta.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    throw new Error('Invalid environment variables', parsed.error);
  }

  return parsed.data;
}

export const env = createEnv();
