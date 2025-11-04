import Database from 'better-sqlite3';
import * as dotenv from 'dotenv';
import { expand } from 'dotenv-expand';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { schema } from '@/db/schema';
import { getLocalD1DB } from '@/db/utils';

expand(dotenv.config());

const sqlite = new Database(getLocalD1DB());
export const db = drizzle(sqlite, { schema });
