import { defineConfig, env } from 'prisma/config';

import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/shared/lib/prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
