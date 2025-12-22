// vitest.setup.ts (or your test setup file)
/* eslint-disable no-console */
import path from 'node:path';
import process from 'node:process';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { afterAll, beforeAll, vi } from 'vitest';

// eslint-disable-next-line import/no-mutable-exports
export let testDb: ReturnType<typeof drizzle>;

vi.mock('cloudflare:workers', () => ({}));
vi.mock('cloudflare:test', () => ({}));

(globalThis as any).caches = {
  default: { async match() { return null; }, async put() {} },
};
(globalThis as any).env = {
  SESSION_KV: { async get() { return null; }, async put() {}, async delete() {} },
};

process.on('uncaughtException', e => console.error('❌ Uncaught exception:', e));
process.on('unhandledRejection', e => console.error('❌ Unhandled rejection:', e));

beforeAll(async () => {
  const sqlite = new Database(':memory:');
  testDb = drizzle(sqlite);

  await migrate(testDb, { migrationsFolder: path.resolve('./drizzle') });
  vi.doMock('@/db', () => ({
    getDB: () => testDb,
  }));

  console.log('🧪 Using in-memory better-sqlite3 database for Vitest');
});

afterAll(async () => {
  (testDb as any)?.session?.close?.();
  console.log('🧹 Closed in-memory test database');
});
