import type { D1Database, IncomingRequestCfProperties } from '@cloudflare/workers-types';
import type { Context } from 'hono';

// Single auth configuration that handles both CLI and runtime scenarios
import type { AppEnv } from '@/lib/types';
import { betterAuth } from 'better-auth';

import { withCloudflare } from 'better-auth-cloudflare';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, anonymous, openAPI, username } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import { getAllowedOrigins } from '@/utils/origin';

import { schema } from '../db/schema';
import { ac, adminRole, creatorRole, playerRole } from './permissions';

function createAuth(c?: Context<AppEnv>) {
  // Use actual DB for runtime, empty object for CLI
  const db = c ? drizzle(c.env.GAME_HUB_DB, { schema, logger: true }) : ({} as any);
  const trustedOrigins = getAllowedOrigins(c?.env?.ALLOWED_ORIGINS || '');

  return betterAuth({
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: true,
        cf: c?.req.raw.cf as IncomingRequestCfProperties | undefined || {},
        d1: c
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
          cookiePrefix: c?.env?.APP_NAME || 'game-hub',
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
    ...(c
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
