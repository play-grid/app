import type { AppEnv } from './types';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/api/db/schema';

export function getDB(c: { env: AppEnv['Bindings'] }) {
  return drizzle(c.env.GAME_HUB_DB, { schema });
}
