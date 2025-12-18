import path from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { testClient } from 'hono/testing';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { fiveSecondsCategories, fiveSecondsQuestions } from '../five-seconds.tables';
import { fiveSecondsQuestionRoutes } from './questions.index';

let sqlite: Database.Database;
let db: ReturnType<typeof drizzle>;

// Create test client directly from the router to preserve type information
const client = testClient(fiveSecondsQuestionRoutes);

beforeAll(async () => {
  sqlite = new Database(':memory:');
  db = drizzle(sqlite);
  await migrate(db, { migrationsFolder: path.resolve('./drizzle') });

  // Seed categories
  await db.insert(fiveSecondsCategories).values([
    { id: 'cat_general_v1', nameEn: 'General', nameAr: 'عام' },
    { id: 'cat_cinema_v1', nameEn: 'Cinema', nameAr: 'سينما' },
    { id: 'cat_tech_games_v1', nameEn: 'Tech & Games', nameAr: 'تقنية وألعاب' },
  ]);

  // Seed questions
  await db.insert(fiveSecondsQuestions).values([
    {
      id: 'q1',
      question: 'Name 3 fruits',
      difficulty: 'easy',
      categoryId: 'cat_general_v1',
      exampleAnswers: 'Apple, Banana, Orange',
    },
    {
      id: 'q2',
      question: 'Name 3 programming languages',
      difficulty: 'medium',
      categoryId: 'cat_tech_games_v1',
      exampleAnswers: 'Python, JavaScript, C++',
    },
    {
      id: 'q3',
      question: 'Name 3 Oscar-winning movies',
      difficulty: 'hard',
      categoryId: 'cat_cinema_v1',
      exampleAnswers: 'Titanic, Gladiator, Parasite',
    },
  ]);

  // mock getDB to return this local db
  // eslint-disable-next-line ts/ban-ts-comment
  // @ts-expect-error
  vi.spyOn(await import('@/db'), 'getDB').mockReturnValue(db);
});

afterAll(() => sqlite?.close());

describe('get /random', () => {
  it('should return random questions (non-repeating until exhausted)', async () => {
    const seen = new Set<string>();
    const responses: string[] = [];

    for (let i = 0; i < 3; i++) {
      const res = await client.random.$get({
        query: {
          difficulty: 'all',
          categoryIds: [],
          excludeIds: Array.from(seen),
          timePerTurn: 5,
        },
      });

      expect(res.status).toBe(HttpStatusCodes.OK);

      const data = await res.json();

      // Type guard to ensure we have a question response
      expect('id' in data).toBe(true);
      if ('id' in data) {
        responses.push(data.id);
        seen.add(data.id);
      }
    }

    // Ensure all 3 unique
    expect(new Set(responses).size).toBe(3);

    // Next call should return 200 OK with NO_QUESTIONS_FOUND code
    const res = await client.random.$get({
      query: {
        difficulty: 'all',
        categoryIds: [],
        excludeIds: Array.from(seen),
        timePerTurn: 5,
      },
    });

    expect(res.status).toBe(HttpStatusCodes.OK);
    const data = await res.json();

    // Type guard for NO_QUESTIONS_FOUND response
    expect('code' in data).toBe(true);
    if ('code' in data) {
      expect(data.code).toBe('NO_QUESTIONS_FOUND');
      expect(data.message).toBe('No questions match the given filters.');
    }
  });

  it('should respect difficulty filter', async () => {
    const res = await client.random.$get({
      query: {
        difficulty: 'hard',
        categoryIds: [],
        excludeIds: [],
        timePerTurn: 5,
      },
    });

    expect(res.status).toBe(HttpStatusCodes.OK);
    const data = await res.json();

    // Type guard to ensure we have a question response
    expect('difficulty' in data).toBe(true);
    if ('difficulty' in data) {
      expect(data.difficulty).toBe('hard');
    }
  });

  it('should respect category filter (multiple categories)', async () => {
    const res = await client.random.$get({
      query: {
        difficulty: 'all',
        categoryIds: ['cat_cinema_v1', 'cat_tech_games_v1'],
        excludeIds: [],
        timePerTurn: 5,
      },
    });

    expect(res.status).toBe(HttpStatusCodes.OK);
    const data = await res.json();

    // Type guard to ensure we have a question response
    expect('categoryId' in data).toBe(true);
    if ('categoryId' in data) {
      expect(['cat_cinema_v1', 'cat_tech_games_v1']).toContain(data.categoryId);
    }
  });

  it('should respect excludeIds', async () => {
    const res = await client.random.$get({
      query: {
        difficulty: 'all',
        categoryIds: [],
        excludeIds: ['q1', 'q2'],
        timePerTurn: 5,
      },
    });

    expect(res.status).toBe(HttpStatusCodes.OK);
    const data = await res.json();

    // Type guard to ensure we have a question response
    expect('id' in data).toBe(true);
    if ('id' in data) {
      expect(data.id).toBe('q3');
    }
  });

  it('should set anti-cache headers correctly', async () => {
    const res = await client.random.$get({
      query: {
        difficulty: 'all',
        categoryIds: [],
        excludeIds: [],
        timePerTurn: 5,
      },
    });

    expect(res.headers.get('Cache-Control')).toBe(
      'no-store, no-cache, must-revalidate, private',
    );
    expect(res.headers.get('Pragma')).toBe('no-cache');
    expect(res.headers.get('Expires')).toBe('0');
  });

  it('should return NO_QUESTIONS_FOUND when filtered result set is empty', async () => {
    const res = await client.random.$get({
      query: {
        difficulty: 'hard',
        categoryIds: ['cat_general_v1'], // mismatch, so none found
        excludeIds: [],
        timePerTurn: 5,
      },
    });

    // Handler returns 200 OK with NO_QUESTIONS_FOUND code
    expect(res.status).toBe(HttpStatusCodes.OK);
    const data = await res.json();

    // Type guard for NO_QUESTIONS_FOUND response
    expect('code' in data).toBe(true);
    if ('code' in data) {
      expect(data.code).toBe('NO_QUESTIONS_FOUND');
      expect(data.message).toBe('No questions match the given filters.');
    }
  });
});
