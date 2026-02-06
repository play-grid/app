import type { router } from '@guess-logo/api/routes';
import { hc } from 'hono/client';

export type Client = ReturnType<typeof hc<typeof router>>;

export function hcWithType(...args: Parameters<typeof hc>): Client {
  return hc<typeof router>(...args);
}

export default hcWithType;
