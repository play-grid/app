import type { Context } from 'hono';
import type { AppEnv } from '@/lib/types';

export function isAllowedOrigin(c: Context<AppEnv>) {
  const allowedOrigins = (c.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const localhostRegex = /^http:\/\/localhost:\d+$/;
  const origin = c.req.header('Origin') || '';

  return allowedOrigins.includes(origin) || localhostRegex.test(origin);
}

export function checkOriginAllowed(
  origin: string,
  allowedOrigins: string,
): boolean {
  const origins = allowedOrigins
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const localhostRegex = /^http:\/\/localhost:\d+$/;

  return origins.includes(origin) || localhostRegex.test(origin);
}

// Option 3: Get all allowed origins (useful for Better Auth config)
export function getAllowedOrigins(allowedOriginsEnv: string): string[] {
  const origins = allowedOriginsEnv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  return origins;
}
