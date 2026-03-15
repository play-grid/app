import type { MiddlewareHandler } from 'hono';
import type { AppEnv, AuthSession } from '@/lib/types';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { createAuth } from '@/auth';

export function protect(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const auth = createAuth(c);
    const session = await auth.api.getSession({ headers: c.req.raw.headers }) as AuthSession | null;

    if (!session || !session.user) {
      return c.json(
        {
          success: false,
          message: 'Unauthorized',
          error: 'No valid session found',
        },
        HttpStatusCodes.UNAUTHORIZED,
      );
    }

    c.set('user', session.user);
    c.set('session', session.session);

    await next();
  };
}

export function isAdmin(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user');

    if (!user || user.role !== 'admin') {
      return c.json(
        {
          success: false,
          message: 'Unauthorized',
          error: 'User is not an admin',
        },
        HttpStatusCodes.FORBIDDEN,
      );
    }

    await next();
  };
}
