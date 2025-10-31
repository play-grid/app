import type { D1Database, IncomingRequestCfProperties } from '@cloudflare/workers-types';
import type { AppEnv } from '@/lib/types';

import { betterAuth } from 'better-auth';
import { withCloudflare } from 'better-auth-cloudflare';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, anonymous, openAPI, username } from 'better-auth/plugins';

import { drizzle } from 'drizzle-orm/d1';
import env from '@/env';
import { getAllowedOrigins } from '@/utils/origin';
import { schema } from '../db/schema';
import { ac, adminRole, creatorRole, playerRole } from './permissions';

// Single auth configuration that handles both CLI and runtime scenarios
function createAuth(cfEnv?: AppEnv['Bindings'], cf?: IncomingRequestCfProperties) {
  // Use actual DB for runtime, empty object for CLI
  const db = cfEnv ? drizzle(cfEnv.GAME_HUB_DB, { schema, logger: true }) : ({} as any);
  const trustedOrigins = getAllowedOrigins(cfEnv?.ALLOWED_ORIGINS || '');

  return betterAuth({
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: cf || {},
        d1: cfEnv
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
          autoSignIn: true,
        },
        plugins: [
          anonymous(),
          username(),
          admin({
            ac,
            roles: { player: playerRole, creator: creatorRole, admin: adminRole },
            defaultRole: 'player',
            adminRoles: ['admin'],
            defaultBanReason: 'Violation of terms',
            impersonationSessionDuration: 3600,
          }),
          openAPI(),
        ],
        trustedOrigins,
        advanced: {
          cookiePrefix: env?.APP_NAME,
        },
        user: {
          additionalFields: {
            role: {
              type: 'string',
              input: false,
            },
            username: {
              type: 'string',
              input: true,
            },
            displayUsername: {
              type: 'string',
              input: true,
            },
            isAnonymous: {
              type: 'boolean',
              input: false,
            },
          },
        },
      },
    ),
    // Only add database adapter for CLI schema generation
    ...(cfEnv
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
