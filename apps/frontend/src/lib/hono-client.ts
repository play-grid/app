import type { router } from '@guess-logo/api/routes';
import { hc } from 'hono/client';

const client = hc<router>('');

export default client;
