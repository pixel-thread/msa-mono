import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_ASSOCIATION_SLUG: z.string().min(2).max(10),
    NEXT_PUBLIC_API_BASE_URL: z.url(),
    NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY: z.number().default(900),
    NEXT_PUBLIC_NODE_ENV: z.enum(['development', 'test', 'production']),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ASSOCIATION_SLUG: process.env.NEXT_PUBLIC_ASSOCIATION_SLUG,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY: process.env.NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY,
    NEXT_PUBLIC_NODE_ENV: process.env.NEXT_PUBLIC_NODE_ENV,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
