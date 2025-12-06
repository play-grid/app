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
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  // BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  APP_NAME: z.string(),
});

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
      CLOUDFLARE_DATABASE_ID: 'mock_cloudflare_database_id',
      BETTER_AUTH_SECRET: 'mock_better_auth_secret',
      APP_NAME: 'mock_app_name',
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
