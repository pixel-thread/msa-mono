import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_ASSOCIATION_SLUG: z.string().min(2).max(10).default('mfsa'),
    NEXT_PUBLIC_API_BASE_URL: z.url(),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ASSOCIATION_SLUG: process.env.NEXT_PUBLIC_ASSOCIATION_SLUG,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_NODE_ENV: process.env.NODE_ENV,
  },
});
