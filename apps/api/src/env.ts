import process from 'node:process';
import { z } from 'zod';
import { logger } from './utils/logger';
// Define the schema once
export const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  TMDB_API_KEY: z.string(),
  LOGO_DEV_API_KEY: z.string(),
  ALL_SPORTS_API_KEY: z.string(),
  CLOUDFLARE_ACCOUNT_ID: z.string(),
  CLOUDFLARE_KV_API_TOKEN: z.string(),
  CLOUDFLARE_D1_TOKEN: z.string(),
  CLOUDFLARE_DATABASE_ID: z.string(),
  CLOUDFLARE_R2_TOKEN: z.string(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  POSTHOG_HOST: z.string(),
  POSTHOG_PUBLIC_KEY: z.string(),
  VITE_PUBLIC_POSTHOG_KEY: z.string().optional(),
  VITE_PUBLIC_POSTHOG_HOST: z.string().optional(),
  VITE_BUCKET_URL: z.string().optional(),
  // BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  APP_NAME: z.string(),
  R2_PUBLIC_URL: z.string(),
}).passthrough();

export type Env = z.infer<typeof EnvSchema>;

// Validate environment variables (works in all environments)
export function validateEnv(envVars: Record<string, unknown>): Env {
  if (process.env.VITEST) {
    return {
      NODE_ENV: 'test',
      TMDB_API_KEY: 'mock_tmdb_api_key',
      LOGO_DEV_API_KEY: 'mock_logo_dev_api_key',
      ALL_SPORTS_API_KEY: 'mock_all_sports_api_key',
      CLOUDFLARE_ACCOUNT_ID: 'mock_cloudflare_account_id',
      LOG_LEVEL: 'debug',
      CLOUDFLARE_KV_API_TOKEN: 'mock_cloudflare_kv_api_token',
      CLOUDFLARE_D1_TOKEN: 'mock_cloudflare_d1_token',
      CLOUDFLARE_R2_TOKEN: 'mock_cloudflare_r2_token',
      CLOUDFLARE_R2_ACCESS_KEY_ID: 'mock_cloudflare_r2_ACCESS_KEY_ID',
      CLOUDFLARE_R2_SECRET_ACCESS_KEY: 'mock_cloudflare_r2_SECRET_ACCESS_KEY',
      CLOUDFLARE_DATABASE_ID: 'mock_cloudflare_database_id',
      POSTHOG_HOST: 'mock_POSTHOG_HOST',
      POSTHOG_PUBLIC_KEY: 'mock_POSTHOG_PUBLIC_KEY',
      VITE_PUBLIC_POSTHOG_KEY: 'mock_vite_posthog_key',
      VITE_PUBLIC_POSTHOG_HOST: 'mock_vite_posthog_host',
      VITE_BUCKET_URL: 'https://test-bucket-url.com',
      BETTER_AUTH_SECRET: 'mock_better_auth_secret',
      APP_NAME: 'mock_app_name',
      R2_PUBLIC_URL: 'https://test-public-url.com',
    };
  }

  const result = EnvSchema.safeParse(envVars);

  if (!result.success) {
    logger.error(result.error.flatten().fieldErrors, '❌ Invalid environment variables:');
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

export function getNodeEnv(): Env {
  return validateEnv(process.env);
}
