import {
  baseQuestionSchema,
  difficultySchema,
  questionWithCategorySchema,
} from '@guess-logo/five-seconds';
import { z } from 'zod';
import { adminListQuerySchema, paginationSchema } from '../shared-schemas';

export const createQuestionsInputSchema = baseQuestionSchema.omit({
  id: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const updateQuestionsInputSchema = createQuestionsInputSchema.partial();

export const questionsOutputSchema = questionWithCategorySchema.extend({
  feedbackCount: z.number(),
});

export const listQuestionsResponseSchema = z.object({
  data: z.array(questionsOutputSchema),
  pagination: paginationSchema,
});

export const listQuestionsQuerySchema = adminListQuerySchema.extend({
  difficulty: difficultySchema.optional(),
  categoryId: z.string().optional(),
});
