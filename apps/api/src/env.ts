import process from 'node:process';
import { z } from 'zod';
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
  // BETTER_AUTH_URL: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  APP_NAME: z.string(),
});

export type Env = z.infer<typeof EnvSchema>;

// Validate environment variables (works in all environments)
export function validateEnv(envVars: Record<string, unknown>): Env {
  const result = EnvSchema.safeParse(envVars);

  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    throw new Error('Invalid environment configuration');
  }

  return result.data;
}

export function getNodeEnv(): Env {
  return validateEnv(process.env);
}
