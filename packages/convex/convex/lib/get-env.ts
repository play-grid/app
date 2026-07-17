import { createEnv } from "kitcn/server";
import { z } from "zod";

export const getEnv = createEnv({
  schema: z.object({
    DEPLOY_ENV: z.string().default("development"),
    SITE_URL: z.string().default("http://localhost:5173"),
    BETTER_AUTH_SECRET: z.string(),
    JWKS: z.string().optional(),
  }),
});
