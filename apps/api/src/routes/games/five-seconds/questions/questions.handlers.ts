import type {
  GetBatchQuestionsRoute,
  GetRandomQuestionRoute,
} from './questions.routes';
import type { AppRouteHandler } from '@/lib/types';
import { and, eq, inArray, not, sql } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { getDB } from '@/db';
import {
  fiveSecondsCategories,
  fiveSecondsQuestions,
} from '../five-seconds.tables';
import { questionResponseSchema } from './questions.schemas';

function calculateReadingTime(text: string): number {
  const charsPerSecond = 10;
  const seconds = Math.ceil(text.length / charsPerSecond);
  return Math.max(2, seconds);
}

function getDifficultyFilter(
  difficulty?: 'easy' | 'medium' | 'hard' | 'all',
): 'easy' | 'medium' | 'hard' | undefined {
  if (!difficulty || difficulty === 'all') {
    return undefined;
  }
  return difficulty;
}

export const getRandomQuestion: AppRouteHandler<GetRandomQuestionRoute> = async (
  c,
) => {
  const db = getDB(c);
  const {
    difficulty,
    categoryIds = [],
    excludeIds = [],
    timePerTurn,
  } = c.req.valid('query');

  const filters: any[] = [];

  const dbDifficulty = getDifficultyFilter(difficulty);
  if (dbDifficulty) {
    filters.push(eq(fiveSecondsQuestions.difficulty, dbDifficulty));
  }

  if (categoryIds.length) {
    filters.push(inArray(fiveSecondsQuestions.categoryId, categoryIds));
  }

  if (excludeIds.length) {
    filters.push(not(inArray(fiveSecondsQuestions.id, excludeIds)));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const [random] = await db
    .select()
    .from(fiveSecondsQuestions)
    .leftJoin(
      fiveSecondsCategories,
      eq(fiveSecondsQuestions.categoryId, fiveSecondsCategories.id),
    )
    .where(whereClause)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (!random) {
    return c.json(
      {
        code: 'NO_QUESTIONS_FOUND' as const,
        message: 'No questions match the given filters.',
      },
      HttpStatusCodes.OK,
    );
  }

  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');

  const readingTime = calculateReadingTime(
    random.five_seconds_questions.text,
  );

  const response = questionResponseSchema.parse({
    id: random.five_seconds_questions.id,
    text: random.five_seconds_questions.text,
    difficulty: random.five_seconds_questions.difficulty,
    categoryId: random.five_seconds_questions.categoryId,
    deletedAt: random.five_seconds_questions.deletedAt,
    createdAt: random.five_seconds_questions.createdAt,
    updatedAt: random.five_seconds_questions.updatedAt,
    totalTime: timePerTurn + readingTime,
  });

  return c.json(response, HttpStatusCodes.OK);
};

export const getBatchQuestions: AppRouteHandler<GetBatchQuestionsRoute> = async (
  c,
) => {
  const db = getDB(c);
  const {
    count,
    difficulty,
    categoryIds = [],
    excludeIds = [],
    timePerTurn,
  } = c.req.valid('query');

  const filters: any[] = [];

  const dbDifficulty = getDifficultyFilter(difficulty);
  if (dbDifficulty) {
    filters.push(eq(fiveSecondsQuestions.difficulty, dbDifficulty));
  }

  if (categoryIds.length) {
    filters.push(inArray(fiveSecondsQuestions.categoryId, categoryIds));
  }

  if (excludeIds.length) {
    filters.push(not(inArray(fiveSecondsQuestions.id, excludeIds)));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const questions = await db
    .select()
    .from(fiveSecondsQuestions)
    .leftJoin(
      fiveSecondsCategories,
      eq(fiveSecondsQuestions.categoryId, fiveSecondsCategories.id),
    )
    .where(whereClause)
    .orderBy(sql`RANDOM()`)
    .limit(count);

  const parsed = questions.map((q) => {
    const readingTime = calculateReadingTime(q.five_seconds_questions.text);

    return questionResponseSchema.parse({
      id: q.five_seconds_questions.id,
      text: q.five_seconds_questions.text,
      difficulty: q.five_seconds_questions.difficulty,
      categoryId: q.five_seconds_questions.categoryId,
      deletedAt: q.five_seconds_questions.deletedAt,
      createdAt: q.five_seconds_questions.createdAt,
      updatedAt: q.five_seconds_questions.updatedAt,
      totalTime: timePerTurn + readingTime,
    });
  });

  return c.json({ questions: parsed }, HttpStatusCodes.OK);
};
