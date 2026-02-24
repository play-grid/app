import path from 'node:path';
import { createFootballPlayersTransformer, createFootballTeamsTransformer, runSync } from '@guess-logo/data-pipeline';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { statItemsTable } from '@/db/schema';

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  sqlite = new Database(':memory:');
  db = drizzle(sqlite);
  await migrate(db, { migrationsFolder: path.resolve('./drizzle') });
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(async () => {
  // Clean up stat_items table after each test
  await db.delete(statItemsTable);
});

afterAll(() => {
  sqlite?.close();
});

describe('api Edge Cases Integration Tests', () => {
  describe('empty Response Handling', () => {
    it('should handle players API returning null response', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(null),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.errors).toBeGreaterThan(0);
      expect(result.inserted).toBe(0);
    });

    it('should handle teams API returning null response', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(null),
        } as Response),
      ));

      const transformer = createFootballTeamsTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.errors).toBeGreaterThan(0);
      expect(result.inserted).toBe(0);
    });

    it('should handle players API returning empty response array', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: [] }),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.errors).toBe(0);
    });

    it('should handle teams API returning empty response array', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: [] }),
        } as Response),
      ));

      const transformer = createFootballTeamsTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(0);
      expect(result.errors).toBe(0);
    });

    it('should handle standings API returning empty nested array structure (REGRESSION BUG)', async () => {
      // This is the bug that was discovered: data.response[0].standings[0] was undefined
      // The fix was to check if standings exists and is not empty before accessing [0]
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            response: [
              { league: { name: 'Premier League' }, standings: [[]] },
            ],
          }),
        } as Response),
      ));

      const transformer = createFootballTeamsTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.errors).toBe(0);
      expect(result.inserted).toBe(0);
    });
  });

  describe('missing Response Properties', () => {
    it('should handle API returning response without response property', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: [] }), // Wrong structure
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.errors).toBeGreaterThan(0);
    });

    it('should handle standings API missing standings property', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            response: [
              { league: { name: 'Premier League' } }, // Missing standings
            ],
          }),
        } as Response),
      ));

      const transformer = createFootballTeamsTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.errors).toBe(0);
      expect(result.inserted).toBe(0);
    });
  });

  describe('api Error Responses', () => {
    it('should handle API returning 404 error', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          json: () => Promise.resolve({ errors: ['Not Found'] }),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.errors).toBeGreaterThan(0);
    });

    it('should handle API returning 500 error', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ errors: ['Internal Server Error'] }),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.errors).toBeGreaterThan(0);
    });
  });

  describe('malformed Objects', () => {
    it('should handle players with null team name', async () => {
      const malformedData = [
        {
          player: {
            id: 1,
            name: 'Player',
            photo: 'url',
          },
          statistics: [
            {
              team: null, // Missing team name
              goals: { total: 10 },
            },
          ],
        },
      ];

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: malformedData }),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      // Should handle gracefully, hint might be null
      expect(result.errors).toBe(0);
      expect(result.inserted).toBeGreaterThan(0);
    });

    it('should handle teams with missing league name', async () => {
      const malformedData = [
        {
          team: {
            id: 40,
            name: 'Liverpool',
            logo: 'url',
          },
          league: null, // Missing league name
          rank: 1,
          all: { win: 25 },
        },
      ];

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            response: [{ league: { name: 'Premier League' }, standings: [[malformedData]] }],
          }),
        } as Response),
      ));

      const transformer = createFootballTeamsTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.errors).toBe(0);
      expect(result.inserted).toBeGreaterThan(0);
    });
  });
});
