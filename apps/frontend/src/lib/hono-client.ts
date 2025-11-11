import type { router } from '@guess-logo/api/routes';
import { hc } from 'hono/client';
import { env } from '@/env';

export type Client = ReturnType<typeof hc<typeof router>>;

export function hcWithType(...args: Parameters<typeof hc>): Client {
  return hc<typeof router>(...args);
}
const client = hcWithType(env.VITE_API_URL);

export default client;
