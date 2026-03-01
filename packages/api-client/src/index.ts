import type { RouterType } from '@playgrid/api-contracts';
import { hc } from 'hono/client';

export type Client = ReturnType<typeof hc<RouterType>>;

export function hcWithType(...args: Parameters<typeof hc>): Client {
  return hc<RouterType>(...args);
}

export default hcWithType;
