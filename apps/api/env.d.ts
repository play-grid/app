import type { z } from 'zod';

declare const EnvSchema: z.ZodObject<{
  NODE_ENV: z.ZodDefault<z.ZodString>;
  TMDB_API_KEY: z.ZodString;
  LOGO_DEV_API_KEY: z.ZodString;
  ALL_SPORTS_API_KEY: z.ZodString;
}, z.core.$strip>;
export type Env = z.infer<typeof EnvSchema>;
export declare function parseEnv(env: unknown): Env;
export declare const env: Env;
export {};
