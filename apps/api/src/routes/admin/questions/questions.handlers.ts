import type { Difficulty } from '@guess-logo/five-seconds';
import type {
  CreateQuestionsRoute,
  DeleteQuestionsRoute,
  GetQuestionsByIdRoute,
  ListQuestionsRoute,
  UpdateQuestionsRoute,
} from './questions.routes';
import type { AppRouteHandler } from '@/lib/types';
import { and, eq, ilike, isNull, sql } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getDB } from '@/db';
import {
  fiveSecondsCategories,
  fiveSecondsFeedback,
  fiveSecondsQuestions,
} from '@/routes/games/five-seconds/five-seconds.tables';

// Helper for excluding soft-deleted records
const notDeleted = isNull(fiveSecondsQuestions.deletedAt);

// Helper function to cast difficulty
function castDifficulty(val: string): Difficulty {
  if (['easy', 'medium', 'hard'].includes(val)) {
    return val as Difficulty;
  }
  return 'easy';
}

// List Questions Handler
export const listQuestionsHandler: AppRouteHandler<
  ListQuestionsRoute
> = async (c) => {
  const db = getDB(c);
  const { page, limit, difficulty, categoryId, search } = c.req.valid(
    'query',
  );

  const offset = (page - 1) * limit;

  const whereConditions = [];

  if (difficulty) {
    whereConditions.push(eq(fiveSecondsQuestions.difficulty, difficulty));
  }

  if (categoryId) {
    whereConditions.push(eq(fiveSecondsQuestions.categoryId, categoryId));
  }

  if (search) {
    whereConditions.push(
      ilike(fiveSecondsQuestions.text, `%${search}%`),
    );
  }

  whereConditions.push(notDeleted);
  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(fiveSecondsQuestions)
    .where(whereClause);

  const rawQuestions = await db
    .select({
      id: fiveSecondsQuestions.id,
      text: fiveSecondsQuestions.text,
      difficulty: fiveSecondsQuestions.difficulty,
      categoryId: fiveSecondsQuestions.categoryId,
      deletedAt: fiveSecondsQuestions.deletedAt,
      createdAt: fiveSecondsQuestions.createdAt,
      updatedAt: fiveSecondsQuestions.updatedAt,
      categoryNameEn: fiveSecondsCategories.nameEn,
      categoryNameAr: fiveSecondsCategories.nameAr,
      feedbackCount: sql<number>`count(${fiveSecondsFeedback.id})`,
    })
    .from(fiveSecondsQuestions)
    .leftJoin(
      fiveSecondsCategories,
      eq(fiveSecondsQuestions.categoryId, fiveSecondsCategories.id),
    )
    .leftJoin(
      fiveSecondsFeedback,
      eq(fiveSecondsQuestions.id, fiveSecondsFeedback.questionId),
    )
    .where(whereClause)
    .groupBy(fiveSecondsQuestions.id)
    .orderBy(fiveSecondsQuestions.createdAt)
    .limit(limit)
    .offset(offset);

  // Cast difficulty to proper type
  const questions = rawQuestions.map(q => ({
    ...q,
    difficulty: castDifficulty(q.difficulty),
    categoryNameEn: q.categoryNameEn ?? undefined,
    categoryNameAr: q.categoryNameAr ?? undefined,
  }));

  const totalPages = Math.ceil(count / limit);

  return c.json({
    data: questions,
    pagination: { page, limit, total: count, totalPages },
  });
};

// Get Questions by ID Handler
export const getQuestionsByIdHandler: AppRouteHandler<
  GetQuestionsByIdRoute
> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const [rawQuestion] = await db
    .select({
      id: fiveSecondsQuestions.id,
      text: fiveSecondsQuestions.text,
      difficulty: fiveSecondsQuestions.difficulty,
      categoryId: fiveSecondsQuestions.categoryId,
      deletedAt: fiveSecondsQuestions.deletedAt,
      createdAt: fiveSecondsQuestions.createdAt,
      updatedAt: fiveSecondsQuestions.updatedAt,
      categoryNameEn: fiveSecondsCategories.nameEn,
      categoryNameAr: fiveSecondsCategories.nameAr,
      feedbackCount: sql<number>`count(${fiveSecondsFeedback.id})`,
    })
    .from(fiveSecondsQuestions)
    .leftJoin(
      fiveSecondsCategories,
      eq(fiveSecondsQuestions.categoryId, fiveSecondsCategories.id),
    )
    .leftJoin(
      fiveSecondsFeedback,
      eq(fiveSecondsQuestions.id, fiveSecondsFeedback.questionId),
    )
    .where(and(eq(fiveSecondsQuestions.id, id), notDeleted))
    .groupBy(fiveSecondsQuestions.id)
    .limit(1);

  if (!rawQuestion) {
    return c.json(
      { error: 'Question not found' },
      HttpStatusCodes.NOT_FOUND,
    );
  }

  const question = {
    ...rawQuestion,
    difficulty: castDifficulty(rawQuestion.difficulty),
    categoryNameEn: rawQuestion.categoryNameEn ?? undefined,
    categoryNameAr: rawQuestion.categoryNameAr ?? undefined,
  };

  return c.json(question);
};

// Create Questions Handler
export const createQuestionsHandler: AppRouteHandler<
  CreateQuestionsRoute
> = async (c) => {
  const db = getDB(c);
  const input = c.req.valid('json');

  try {
    // Check if question already exists
    const existingQuestion = await db
      .select()
      .from(fiveSecondsQuestions)
      .where(and(eq(fiveSecondsQuestions.text, input.text), notDeleted))
      .limit(1);

    if (existingQuestion.length > 0) {
      return c.json(
        { error: 'Question already exists' },
        HttpStatusCodes.CONFLICT,
      );
    }

    // Check if category exists
    const category = await db
      .select()
      .from(fiveSecondsCategories)
      .where(eq(fiveSecondsCategories.id, input.categoryId))
      .limit(1);

    if (category.length === 0) {
      return c.json(
        { error: 'Category does not exist' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    // Create the question
    const [newQuestion] = await db
      .insert(fiveSecondsQuestions)
      .values({
        text: input.text,
        difficulty: input.difficulty,
        categoryId: input.categoryId,
      })
      .returning();

    // Fetch with category info and feedback count
    const [rawQuestion] = await db
      .select({
        id: fiveSecondsQuestions.id,
        text: fiveSecondsQuestions.text,
        difficulty: fiveSecondsQuestions.difficulty,
        categoryId: fiveSecondsQuestions.categoryId,
        deletedAt: fiveSecondsQuestions.deletedAt,
        createdAt: fiveSecondsQuestions.createdAt,
        updatedAt: fiveSecondsQuestions.updatedAt,
        categoryNameEn: fiveSecondsCategories.nameEn,
        categoryNameAr: fiveSecondsCategories.nameAr,
        feedbackCount: sql<number>`count(${fiveSecondsFeedback.id})`,
      })
      .from(fiveSecondsQuestions)
      .leftJoin(
        fiveSecondsCategories,
        eq(fiveSecondsQuestions.categoryId, fiveSecondsCategories.id),
      )
      .leftJoin(
        fiveSecondsFeedback,
        eq(fiveSecondsQuestions.id, fiveSecondsFeedback.questionId),
      )
      .where(eq(fiveSecondsQuestions.id, newQuestion.id))
      .groupBy(fiveSecondsQuestions.id)
      .limit(1);

    const question = {
      ...rawQuestion!,
      difficulty: castDifficulty(rawQuestion!.difficulty),
      categoryNameEn: rawQuestion!.categoryNameEn ?? undefined,
      categoryNameAr: rawQuestion!.categoryNameAr ?? undefined,
    };

    return c.json(question, HttpStatusCodes.CREATED);
  }
  catch (error: any) {
    console.error('Error creating question:', error);
    if (error.message?.includes('FOREIGN KEY constraint')) {
      return c.json(
        { error: 'Invalid categoryId' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }
    return c.json(
      { error: 'Internal server error' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

// Update Questions Handler
export const updateQuestionsHandler: AppRouteHandler<
  UpdateQuestionsRoute
> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');
  const input = c.req.valid('json');

  try {
    const existingQuestion = await db
      .select()
      .from(fiveSecondsQuestions)
      .where(and(eq(fiveSecondsQuestions.id, id), notDeleted))
      .limit(1);

    if (existingQuestion.length === 0) {
      return c.json(
        { error: 'Question not found' },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    // Check uniqueness if text is being updated
    if (input.text) {
      const duplicateQuestion = await db
        .select()
        .from(fiveSecondsQuestions)
        .where(
          and(
            eq(fiveSecondsQuestions.text, input.text),
            sql`${fiveSecondsQuestions.id} != ${id}`,
            notDeleted,
          ),
        )
        .limit(1);

      if (duplicateQuestion.length > 0) {
        return c.json(
          { error: 'Question already exists' },
          HttpStatusCodes.CONFLICT,
        );
      }
    }

    // Check category exists if categoryId is being updated
    if (input.categoryId) {
      const category = await db
        .select()
        .from(fiveSecondsCategories)
        .where(eq(fiveSecondsCategories.id, input.categoryId))
        .limit(1);

      if (category.length === 0) {
        return c.json(
          { error: 'Category does not exist' },
          HttpStatusCodes.BAD_REQUEST,
        );
      }
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (input.text !== undefined)
      updateData.text = input.text;
    if (input.difficulty !== undefined)
      updateData.difficulty = input.difficulty;
    if (input.categoryId !== undefined)
      updateData.categoryId = input.categoryId;

    // Update the question
    await db
      .update(fiveSecondsQuestions)
      .set(updateData)
      .where(eq(fiveSecondsQuestions.id, id));

    // Fetch updated question
    const [rawQuestion] = await db
      .select({
        id: fiveSecondsQuestions.id,
        text: fiveSecondsQuestions.text,
        difficulty: fiveSecondsQuestions.difficulty,
        categoryId: fiveSecondsQuestions.categoryId,
        deletedAt: fiveSecondsQuestions.deletedAt,
        createdAt: fiveSecondsQuestions.createdAt,
        updatedAt: fiveSecondsQuestions.updatedAt,
        categoryNameEn: fiveSecondsCategories.nameEn,
        categoryNameAr: fiveSecondsCategories.nameAr,
        feedbackCount: sql<number>`count(${fiveSecondsFeedback.id})`,
      })
      .from(fiveSecondsQuestions)
      .leftJoin(
        fiveSecondsCategories,
        eq(fiveSecondsQuestions.categoryId, fiveSecondsCategories.id),
      )
      .leftJoin(
        fiveSecondsFeedback,
        eq(fiveSecondsQuestions.id, fiveSecondsFeedback.questionId),
      )
      .where(eq(fiveSecondsQuestions.id, id))
      .groupBy(fiveSecondsQuestions.id)
      .limit(1);

    const question = {
      ...rawQuestion!,
      difficulty: castDifficulty(rawQuestion!.difficulty),
      categoryNameEn: rawQuestion!.categoryNameEn ?? undefined,
      categoryNameAr: rawQuestion!.categoryNameAr ?? undefined,
    };

    return c.json(question);
  }
  catch (error: any) {
    console.error('Error updating question:', error);
    if (error.message?.includes('FOREIGN KEY constraint')) {
      return c.json(
        { error: 'Invalid categoryId' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }
    return c.json(
      { error: 'Internal server error' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};

// Delete Questions Handler (Soft Delete)
export const deleteQuestionsHandler: AppRouteHandler<
  DeleteQuestionsRoute
> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  try {
    const existingQuestion = await db
      .select()
      .from(fiveSecondsQuestions)
      .where(and(eq(fiveSecondsQuestions.id, id), notDeleted))
      .limit(1);

    if (existingQuestion.length === 0) {
      return c.json(
        { error: 'Question not found' },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    // Soft delete
    await db
      .update(fiveSecondsQuestions)
      .set({ deletedAt: new Date() })
      .where(eq(fiveSecondsQuestions.id, id));

    return c.body(null, HttpStatusCodes.NO_CONTENT);
  }
  catch (error: any) {
    console.error('Error deleting question:', error);
    return c.json(
      { error: 'Internal server error' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
