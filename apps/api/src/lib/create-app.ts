import type { AppOpenAPI } from './types';

import { cache } from 'hono/cache';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';
import { notFound, onError } from 'stoker/middlewares';

import { validateEnv } from '@/env';

import rateLimiterMiddleware from '@/middlewares/rate-limter';
import { isAllowedOrigin } from '@/utils/origin';
import { createAuth } from '../auth';
import { BASE_PATH } from './constants';
import { clearRequestContext, setRequestContext } from './context-manager';
import createRouter from './create-router';

export default function createApp(): AppOpenAPI {
  const app = createRouter();

  let envValidated = false;
  app.use('*', async (c, next) => {
    if (!envValidated) {
      try {
        validateEnv(c.env as unknown as Record<string, unknown>);
        envValidated = true;
        // eslint-disable-next-line no-console
        console.log('✅ Environment variables validated successfully');
      }
      catch (error) {
        console.error('Environment validation failed:', error);
        return c.json({ error: 'Server configuration error' }, 500);
      }
    }
    await next();
  });

  app.use('*', async (c, next) => {
    setRequestContext(c);
    await next();
    clearRequestContext();
  });

  app.use('*', async (c, next) => {
    const origin = c.req.header('Origin') || '';
    const allowed = isAllowedOrigin(c);

    const handler = cors({
      origin: () => (allowed ? origin : undefined),
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
      maxAge: 600,
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
    const auth = createAuth(c);
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
