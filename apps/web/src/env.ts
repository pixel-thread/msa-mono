import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_ASSOCIATION_SLUG: z.string().min(2).max(10).default('mfsa'),
  NEXT_PUBLIC_API_BASE_URL: z.url(),
  NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']),
});

function createEnv() {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_APP_URL: import.meta.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ASSOCIATION_SLUG: import.meta.env.NEXT_PUBLIC_ASSOCIATION_SLUG,
    NEXT_PUBLIC_API_BASE_URL: import.meta.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_NODE_ENV: import.meta.env.NEXT_PUBLIC_NODE_ENV,
  });

  if (!parsed.success) {
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

export const env = createEnv();
