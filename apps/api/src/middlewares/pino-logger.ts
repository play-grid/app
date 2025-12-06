import { createBaseLogger } from '@guess-logo/logger';
import { pinoLogger as honoPino } from 'hono-pino';

export function pinoLogger() {
  return honoPino({
    pino: createBaseLogger('api'),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}
