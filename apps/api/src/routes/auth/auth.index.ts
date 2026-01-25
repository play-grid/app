import type { Context } from 'hono';
import type { AppEnv } from '@/lib/types';
import { createAuth } from '@/auth';
import createRouter from '@/lib/create-router';

const authRoutes = createRouter();

async function handleAuth(c: Context<AppEnv>) {
  const auth = createAuth(c);
  return auth.handler(c.req.raw);
}

authRoutes.on(['POST', 'GET'], '/*', handleAuth);

export default authRoutes;
