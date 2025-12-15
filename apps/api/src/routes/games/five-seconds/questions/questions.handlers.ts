import type { getBatchQuestionsRoute, getRandomQuestionRoute } from './questions.routes';
import type { AppRouteHandler } from '@/lib/types';
import { and, eq, inArray, not, sql } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { getDB } from '@/db';
import { fiveSecondsCategories, fiveSecondsQuestions } from '../five-seconds.tables';
import { questionSchema } from './questions.schemas';

function calculateReadingTime(text: string) {
  const charsPerSecond = 10;
  const seconds = Math.ceil(text.length / charsPerSecond);
  return `${Math.max(2, seconds)}s`;
}

export const getRandomQuestion: AppRouteHandler<getRandomQuestionRoute> = async (c) => {
  const db = getDB(c);
  const { difficulty, categoryIds = [], excludeIds = [] } = c.req.valid('query');

  // Build WHERE clause
  const filters: any[] = [];

  if (difficulty && difficulty !== 'all') {
    filters.push(eq(fiveSecondsQuestions.difficulty, difficulty));
  }

  if (categoryIds.length) {
    filters.push(inArray(fiveSecondsQuestions.categoryId, categoryIds));
  }

  if (excludeIds.length) {
    filters.push(not(inArray(fiveSecondsQuestions.id, excludeIds)));
  }

  const whereClause = filters.length
    ? filters.reduce((acc, f) => and(acc, f))
    : undefined;

  // Get ONE random question directly from DB
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
        code: 'NO_QUESTIONS_FOUND',
        message: 'No questions match the given filters.',
      } as const,
      HttpStatusCodes.OK,
    );
  }

  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');

  const response = questionSchema.parse({
    ...random.five_seconds_questions,
    categoryId: random.five_seconds_categories?.id,
    category: random.five_seconds_categories,
    estimatedReadingTime: calculateReadingTime(random.five_seconds_questions.question),
    exampleAnswers: random.five_seconds_questions.exampleAnswers ?? '',
    metadata: random.five_seconds_questions.metadata ?? {},
  });

  return c.json(response, HttpStatusCodes.OK);
};

export const getBatchQuestions: AppRouteHandler<getBatchQuestionsRoute> = async (c) => {
  const db = getDB(c);
  const { count, difficulty, categoryIds = [], excludeIds = [] } = c.req.valid('query');

  const filters: any[] = [];

  if (difficulty && difficulty !== 'all') {
    filters.push(eq(fiveSecondsQuestions.difficulty, difficulty));
  }

  if (categoryIds.length) {
    filters.push(inArray(fiveSecondsQuestions.categoryId, categoryIds));
  }

  if (excludeIds.length) {
    filters.push(not(inArray(fiveSecondsQuestions.id, excludeIds)));
  }

  const whereClause = filters.length ? and(...filters) : undefined;
  
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

  if (questions.length === 0) {
    return c.json({ questions: [] }, HttpStatusCodes.OK);
  }

  const parsed = questions.map(q => questionSchema.parse({
    ...q.five_seconds_questions,
    categoryId: q.five_seconds_categories?.id,
    category: q.five_seconds_categories,
    estimatedReadingTime: calculateReadingTime(q.five_seconds_questions.question),
    exampleAnswers: q.five_seconds_questions.exampleAnswers ?? '',
    metadata: q.five_seconds_questions.metadata ?? {},
  }));

  return c.json({ questions: parsed }, HttpStatusCodes.OK);
};
