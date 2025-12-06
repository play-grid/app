import { pinoLogger as honoPino } from 'hono-pino';
import { logger } from '@/utils/logger';

export function pinoLogger() {
  return honoPino({
    pino: logger,
    http: {
      reqId: () => crypto.randomUUID(),
    },
  });
}
