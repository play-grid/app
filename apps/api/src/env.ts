/* eslint-disable node/prefer-global/process */
import path from 'node:path';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { z } from 'zod';

expand(config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  ),
}));
const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  TMDB_API_KEY: z.string(),
  LOGO_DEV_API_KEY: z.string(),
  ALL_SPORTS_API_KEY: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_KV_API_TOKEN: z.string(),
  CLOUDFLARE_D1_TOKEN: z.string(),
  CLOUDFLARE_DATABASE_ID: z.string(),
  QUESTIONS_KV_ID: z.string(),
  BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;

const { data: env, error } = EnvSchema.safeParse(process.env);

if (error) {
  console.error('❌ Invalid env:');
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  process.exit(1);
}

export default env!;
