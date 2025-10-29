import type { D1Database, IncomingRequestCfProperties } from '@cloudflare/workers-types';
import type { AppEnv } from '@/lib/types';
import { betterAuth } from 'better-auth';
import { withCloudflare } from 'better-auth-cloudflare';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { openAPI } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import { schema } from '../db/schema';

// Single auth configuration that handles both CLI and runtime scenarios
function createAuth(env?: AppEnv['Bindings'], cf?: IncomingRequestCfProperties) {
  // Use actual DB for runtime, empty object for CLI
  const db = env ? drizzle(env.GAME_HUB_DB, { schema, logger: true }) : ({} as any);

  return betterAuth({
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf || {},
        d1: env
          ? {
              db,
              options: {
                usePlural: true,
                debugLogs: true,
              },
            }
          : undefined,
      },
      {
        emailAndPassword: {
          enabled: true,
        },
        plugins: [
          openAPI(),
        ],
      },
    ),
    // Only add database adapter for CLI schema generation
    ...(env
      ? {}
      : {
          database: drizzleAdapter({} as D1Database, {
            provider: 'sqlite',
            usePlural: true,
            debugLogs: true,
          }),
        }),
  });
}

// Export for CLI schema generation
export const auth = createAuth();

// Export for runtime usage
export { createAuth };
