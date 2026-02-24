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

describe('e2E Pipeline Integration Tests', () => {
  describe('football Players Pipeline', () => {
    it('should sync football players from API to database', async () => {
      const mockPlayersData = [
        {
          player: {
            id: 306,
            name: 'Mohamed Salah',
            photo: 'https://media.api-sports.io/football/players/306.png',
          },
          statistics: [
            {
              team: {
                name: 'Liverpool',
              },
              goals: {
                total: 29,
                assists: 18,
              },
              games: {
                appearences: 38,
              },
            },
          ],
        },
      ];

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: mockPlayersData }),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.inserted).toBe(3);
      expect(result.errors).toBe(0);

      const dbItems = await db.select().from(statItemsTable);
      expect(dbItems.length).toBe(3);

      const salahGoals = dbItems.find((i: any) => i.name === 'Mohamed Salah' && i.metricType === 'goals');
      expect(salahGoals).toMatchObject({
        value: 29,
        unit: 'goals this season',
        imageUrl: 'https://media.api-sports.io/football/players/306.png',
        hint: 'Liverpool',
      });
    });

    it('should handle API returning empty data gracefully', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: [] }),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.inserted).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.updated).toBe(0);
    });

    it('should handle partial statistics (null values)', async () => {
      const partialResponse = [
        {
          player: {
            id: 2,
            name: 'Partial Player',
            photo: 'https://example.com/partial.jpg',
          },
          statistics: [
            {
              team: { name: 'Team B' },
              goals: { total: null, assists: null },
              games: { appearences: 15 },
            },
          ],
        },
      ];

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: partialResponse }),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.inserted).toBe(1);

      const dbItems = await db.select().from(statItemsTable);
      expect(dbItems[0].metricType).toBe('appearances');
    });
  });

  describe('football Teams Pipeline', () => {
    it('should sync football teams from API to database', async () => {
      const premierLeagueTeam = {
        team: {
          id: 40,
          name: 'Liverpool',
          logo: 'https://media.api-sports.io/football/teams/40.png',
        },
        league: {
          name: 'Premier League',
        },
        rank: 1,
        all: {
          win: 25,
        },
      };

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            response: [
              { league: { name: 'Premier League' }, standings: [[premierLeagueTeam]] },
            ],
          }),
        } as Response),
      ));

      const transformer = createFootballTeamsTransformer({ apiKey: 'test-key' });
      const result = await runSync(transformer, db, { table: statItemsTable });

      expect(result.inserted).toBe(2);
      expect(result.errors).toBe(0);

      const dbItems = await db.select().from(statItemsTable);
      expect(dbItems.length).toBe(2);

      const liverpoolPosition = dbItems.find((i: any) => i.name === 'Liverpool' && i.metricType === 'position');
      expect(liverpoolPosition).toMatchObject({
        entity: 'team',
        value: 1,
        unit: 'league position',
        hint: 'Premier League',
      });
    });

    it('should handle standings API returning empty nested array (REGRESSION BUG)', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            response: [
              { league: { name: 'Premier League' }, standings: [] },
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

  describe('upsert Behavior', () => {
    it('should update existing items instead of creating duplicates (CRITICAL)', async () => {
      // Given: First sync creates initial items
      const mockData = [
        {
          player: {
            id: 306,
            name: 'Mohamed Salah',
            photo: 'https://example.com/salah.jpg',
          },
          statistics: [
            {
              team: { name: 'Liverpool' },
              goals: { total: 29 },
            },
          ],
        },
      ];

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: mockData }),
        } as Response),
      ));

      const transformer = createFootballPlayersTransformer({ apiKey: 'test-key' });

      const firstSync = await runSync(transformer, db, { table: statItemsTable });
      expect(firstSync.inserted).toBe(1);

      // When: Second sync with updated value
      const updatedData = [
        {
          player: {
            id: 306,
            name: 'Mohamed Salah',
            photo: 'https://example.com/salah.jpg',
          },
          statistics: [
            {
              team: { name: 'Liverpool' },
              goals: { total: 35 },
            },
          ],
        },
      ];

      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ response: updatedData }),
        } as Response),
      ));

      const secondSync = await runSync(transformer, db, { table: statItemsTable });

      // Then: Should update existing items, not create duplicates
      expect(secondSync.inserted).toBe(0);
      expect(secondSync.updated).toBe(3); // 3 metrics per player
      expect(secondSync.skipped).toBe(0);
      expect(secondSync.errors).toBe(0);

      // Verify database has 3 rows with updated values
      const dbItems = await db.select().from(statItemsTable);
      expect(dbItems.length).toBe(3);
      const salahItems = dbItems.filter((i: any) => i.name === 'Mohamed Salah');
      expect(salahItems.length).toBe(3);
      expect(salahItems.every((i: any) => i.value === 35)).toBe(true);
      expect(salahItems.every((i: any) => i.lastSyncedAt != null)).toBe(true);
    });
  });
});
