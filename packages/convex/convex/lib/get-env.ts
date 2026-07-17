import { createEnv } from "kitcn/server";
import { z } from "zod";

const envSchema = z.object({
  DEPLOY_ENV: z.string().default("development"),
  SITE_URL: z.string().default("http://localhost:5173"),
  BETTER_AUTH_SECRET: z.string(),
  JWKS: z.string().optional(),
  ADMIN: z
    .string()
    .default("")
    .transform((s) => (s ? s.split(",") : []))
    .pipe(z.array(z.string())),
});

export const getEnv = createEnv({ schema: envSchema });