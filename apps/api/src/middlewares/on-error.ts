import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Env } from '@/env';
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes';

import { captureException } from './posthog';

export const posthogErrorHandler: ErrorHandler = async (err, c) => {
  const statusCode
    = 'status' in err && typeof err.status === 'number' && err.status !== OK
      ? (err.status as ContentfulStatusCode)
      : INTERNAL_SERVER_ERROR;

  const distinctId = c.get('user')?.id ?? `error-anon-${crypto.randomUUID().slice(0, 8)}`;
  const isProd = c.env.NODE_ENV === 'production';

  captureException(c, c.env as Env, err, distinctId, {
    path: c.req.path,
    method: c.req.method,
    url: c.req.url,
  });

  return c.json(
    {
      message: 'Internal Server Error',
      ...(isProd
        ? {}
        : { error: err.message, stack: err.stack }),
    },
    statusCode,
  );
};
