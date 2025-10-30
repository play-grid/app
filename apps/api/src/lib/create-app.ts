import type { AppOpenAPI } from './types';

import { cache } from 'hono/cache';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { notFound, onError } from 'stoker/middlewares';

import rateLimiterMiddleware from '@/middlewares/rate-limter';

import { createAuth } from '../auth';
import { BASE_PATH } from './constants';
import createRouter from './create-router';

export default function createApp(): AppOpenAPI {
  const app = createRouter();

  app.use('*', async (c, next) => {
    const allowedOrigins = (c.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const localhostRegex = /^http:\/\/localhost:\d+$/;
    const origin = c.req.header('Origin') || '';
    const isAllowed = allowedOrigins.includes(origin) || localhostRegex.test(origin);

    const handler = cors({
      origin: () => (isAllowed ? origin : undefined),
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    });

    return handler(c, next);
  });

  app.use('*', cache({
    cacheName: 'logo-api',
    cacheControl: 'public, max-age=86400',
  }));

  app.use('*', etag());
  app.use('*', (c, next) => rateLimiterMiddleware(c)(c, next));

  app.use('*', async (c, next) => {
    const auth = createAuth(c.env, c.req.raw.cf as IncomingRequestCfProperties | undefined);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set('user', null);
      c.set('session', null);
      await next();

      return;
    }

    c.set('user', session.user);
    c.set('session', session.session);
    await next();
  });

  app.notFound(notFound);
  app.onError(onError);

  return app.basePath(BASE_PATH);
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route('/', router);
}
