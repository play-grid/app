import type { Env } from '@/env';
import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { captureEvent } from './posthog';

export const posthogMiddleware = createMiddleware(async (c, next) => {
  const start = Date.now();

  let distinctId = c.get('user')?.id;

  if (!distinctId) {
    let anonId = getCookie(c, 'anon_id');

    if (!anonId) {
      anonId = crypto.randomUUID();

      setCookie(c, 'anon_id', anonId, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });
    }

    distinctId = anonId;
  }

  await captureEvent(c, c.env as Env, {
    distinctId,
    event: '$pageview',
    properties: {
      $current_url: c.req.url,
      $method: c.req.method,
      $pathname: c.req.path,
      $ip: c.req.header('cf-connecting-ip'),
      $browser: c.req.header('user-agent'),

      is_authenticated: !!c.get('user'),
      user_role: c.get('user')?.role || 'anonymous',
    },
  });

  await next();

  const durationMs = Date.now() - start;

  await captureEvent(c, c.env as Env, {
    distinctId,
    event: 'server_response',
    properties: {
      status: c.res.status,
      duration_ms: durationMs,
      path: c.req.path,
      is_authenticated: !!c.get('user'),
    },
  });
});
