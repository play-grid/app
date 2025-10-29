import type { AppEnv } from '../lib/types';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/db/schema';

export function getDB(c: { env: AppEnv['Bindings'] }) {
  return drizzle(c.env.GAME_HUB_DB, { schema });
}
