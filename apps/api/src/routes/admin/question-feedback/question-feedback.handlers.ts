import type { ListQuestionFeedbackRoute } from './question-feedback.routes';
import type { AppRouteHandler } from '@/lib/types';
import { eq, sql } from 'drizzle-orm';
import { getDB } from '@/db';
import { fiveSecondsFeedback, fiveSecondsQuestions } from '@/routes/games/five-seconds/five-seconds.tables';

export const listQuestionFeedbackHandler: AppRouteHandler<
  ListQuestionFeedbackRoute
> = async (c) => {
  const db = getDB(c);
  const { page, limit } = c.req.valid('query');
  const pageNumber = Number.parseInt(page, 10);
  const limitNumber = Number.parseInt(limit, 10);

  const offset = (pageNumber - 1) * limitNumber;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(fiveSecondsFeedback);

  const rawFeedbacks = await db
    .select({
      id: fiveSecondsFeedback.id,
      questionId: fiveSecondsFeedback.questionId,
      type: fiveSecondsFeedback.type,
      comment: fiveSecondsFeedback.comment,
      playerId: fiveSecondsFeedback.playerId,
      createdAt: fiveSecondsFeedback.createdAt,
      updatedAt: fiveSecondsFeedback.updatedAt,
      questionText: fiveSecondsQuestions.text,
    })
    .from(fiveSecondsFeedback)
    .leftJoin(
      fiveSecondsQuestions,
      eq(fiveSecondsFeedback.questionId, fiveSecondsQuestions.id),
    )
    .orderBy(fiveSecondsFeedback.createdAt)
    .limit(limitNumber)
    .offset(offset);

  const data = rawFeedbacks.map(f => ({
    ...f,
    questionText: f.questionText ?? '',
  }));

  const totalPages = Math.ceil(count / limitNumber);

  return c.json({
    data,
    pagination: { page: pageNumber, limit: limitNumber, total: count, totalPages },
  });
};
