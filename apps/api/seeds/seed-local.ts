import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Database from 'better-sqlite3';

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { seedD1Questions } from './shared/questions';

async function main() {
  const dbDir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/';
  const files = await fs.readdir(dbDir);
  const dbFile = files.find(f => f.endsWith('.sqlite'));
  if (!dbFile) {
    throw new Error('Could not find a .sqlite file in the wrangler directory');
  }
  const sqlite = new Database(path.join(dbDir, dbFile));
  const db = drizzle(sqlite);
  await seedD1Questions(db);
}

main().catch((error) => {
  console.error('Error seeding local database:', error);
  process.exit(1);
});
