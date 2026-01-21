import type { Context } from 'hono';

import type { AppEnv, AppOpenAPI } from './types';
import { cache } from 'hono/cache';
import { cors } from 'hono/cors';
import { etag } from 'hono/etag';

import { notFound } from 'stoker/middlewares';

import { validateEnv } from '@/env';
import { posthogErrorHandler } from '@/middlewares/on-error';
import { pinoLogger } from '@/middlewares/pino-logger';
import { posthogMiddleware } from '@/middlewares/posthog-middleware';
import { rateLimit } from '@/middlewares/rate-limter';
import { logger } from '@/utils/logger';
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
        logger.info('✅ Environment variables validated successfully');
      }
      catch (error) {
        logger.error(error, 'Environment validation failed:');
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

  const isWebSocketUpgrade = (c: Context<AppEnv, '*'>) => {
    const upgradeHeader = c.req.header('Upgrade');
    return upgradeHeader && upgradeHeader.toLowerCase() === 'websocket';
  };

  app.use('*', async (c, next) => {
    if (isWebSocketUpgrade(c)) {
      return next();
    }

    return cache({
      cacheName: 'logo-api',
      cacheControl: 'public, max-age=86400',
    })(c, next);
  });

  app.use('*', async (c, next) => {
    if (isWebSocketUpgrade(c)) {
      return next();
    }
    return etag()(c, next);
  });

  app.use('*', rateLimit({
    rateLimiter: c => c.env.RATE_LIMITER,
    getRateLimitKey: async (c) => {
      const auth = createAuth(c);
      const session = await auth.api.getSession({ headers: c.req.raw.headers });
      const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'anonymous';
      const userPart = session ? session.user.id : 'anon';
      return `${userPart}:${ip}`;
    },
  }));

  app.use('*', posthogMiddleware);
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
  app.onError(posthogErrorHandler);
  app.use(pinoLogger());

  return app.basePath(BASE_PATH);
}

export function createTestApp<R extends AppOpenAPI>(router: R) {
  return createApp().route('/', router);
}
