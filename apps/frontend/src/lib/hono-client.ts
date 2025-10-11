import type { router } from '@guess-logo/api/routes';
import { hc } from 'hono/client';
import { env } from '@/env';

const client = hc<router>(env.VITE_API_URL);

export default client;
