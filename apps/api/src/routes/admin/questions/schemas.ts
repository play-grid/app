import {
  baseQuestionSchema,
  difficultySchema,
  questionWithCategorySchema,
} from '@guess-logo/five-seconds';
import { z } from 'zod';
import { paginationSchema } from '../shared-schemas';

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

export const listQuestionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  difficulty: difficultySchema.optional(),
  categoryId: z.string().optional(),
  search: z.string().optional(),
});
