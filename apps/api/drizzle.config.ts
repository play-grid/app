import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { defineConfig } from 'drizzle-kit';
import { getLocalD1DB } from '@/db/utils';
import { getNodeEnv } from '@/env';

const devVarsPath = path.resolve(__dirname, '.dev.vars');
if (fs.existsSync(devVarsPath)) {
  const devVars = fs.readFileSync(devVarsPath, 'utf-8');
  for (const line of devVars.split('\n')) {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts
        .join('=')
        .trim()
        .replace(/(^"$|^'|'$)/g, '');
      if (key && !process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  }
}

const env = getNodeEnv();

const isProd = env.NODE_ENV === 'production';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
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
