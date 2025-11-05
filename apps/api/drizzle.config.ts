import process from 'node:process';
import { defineConfig } from 'drizzle-kit';
import { getLocalD1DB } from '@/db/utils';
import { getNodeEnv } from '@/env';

const env = getNodeEnv();

const isProd = env.NODE_ENV === 'production';
const isTest = process.env.VITEST === 'true';

export default defineConfig({
  schema: './src/db/schema.ts',
  // Still distinguish output folders
  out: isProd || isTest ? './drizzle' : './drizzle-local',
  // drizzle-kit uses 'sqlite' even for D1
  dialect: 'sqlite',
  ...(isProd
    ? {
        driver: 'd1-http',
        dbCredentials: {
          accountId: env.CLOUDFLARE_ACCOUNT_ID,
          databaseId: env.CLOUDFLARE_DATABASE_ID,
          token: env.CLOUDFLARE_D1_TOKEN,
        },
      }
    : {
        dbCredentials: {
          url: getLocalD1DB(),
        },
      }),
});
