/* eslint-disable no-console */
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import Database from 'better-sqlite3';

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { seedD1Categories } from './shared/seed-categories';
import { seedD1Questions } from './shared/seed-questions';
import { seedD1Sports } from './shared/seed-sports';

async function main() {
  const dbDir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject/';
  const files = await fs.readdir(dbDir);
  const dbFile = files.find(f => f.endsWith('.sqlite'));

  if (!dbFile) {
    throw new Error('Could not find a .sqlite file in the wrangler directory');
  }

  const sqlitePath = path.join(dbDir, dbFile);
  console.log('Using SQLite file:', sqlitePath);

  const sqlite = new Database(sqlitePath);
  const db = drizzle(sqlite);

  // Run seeders
  // await seedD1Questions(db);
  await seedD1Sports(db);

  sqlite.close();
  console.log('Database seeded and closed.');
}

main().catch((error) => {
  console.error('Error seeding local database:', error);
  process.exit(1);
});
