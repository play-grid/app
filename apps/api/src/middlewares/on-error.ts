import type { ErrorHandler } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { INTERNAL_SERVER_ERROR, OK } from 'stoker/http-status-codes';

import { getNodeEnv } from '@/env';
import { captureException } from './posthog';

const isProd = getNodeEnv().NODE_ENV === 'production';

export const posthogErrorHandler: ErrorHandler = async (err, c) => {
  const statusCode
    = 'status' in err && typeof err.status === 'number' && err.status !== OK
      ? (err.status as ContentfulStatusCode)
      : INTERNAL_SERVER_ERROR;

  const distinctId = c.get('user')?.id ?? `error-anon-${crypto.randomUUID().slice(0, 8)}`;

  captureException(c, err, distinctId, {
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
