import type { Context } from 'hono';
import type { AppEnv } from '../lib/types';
import { WorkersKVStore } from '@hono-rate-limiter/cloudflare';
import { rateLimiter } from 'hono-rate-limiter';

export default function rateLimiterMiddleware(c: Context) {
  const isDevelopment = c.env.NODE_ENV === 'development';

  return rateLimiter<AppEnv>({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: isDevelopment ? 1_000_000 : 100, // Significantly higher limit for development
    standardHeaders: 'draft-6', // Include rate limit headers in response
    keyGenerator: c => c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'anonymous',
    store: new WorkersKVStore({
      namespace: c.env.RATE_LIMIT,
      prefix: 'logo_rl:', // Prefix for rate limit keys
    }),
    message: { error: 'Too many requests, please try again later.' },
  });
}
