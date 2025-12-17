import {
  baseQuestionSchema,
  difficultySchema,
} from '@guess-logo/five-seconds';
import { z } from 'zod';

export const questionSchema = baseQuestionSchema.extend({
  totalTime: z.number(),
});

export type Question = z.infer<typeof questionSchema>;

export const questionQuery = z.object({
  packId: z.string().optional(),
  difficulty: difficultySchema.optional(),
  categoryIds: z
    .preprocess(
      (val) => {
        if (!val)
          return [];
        return Array.isArray(val) ? val : [val];
      },
      z.array(z.string()),
    )
    .optional(),
  excludeIds: z
    .preprocess(
      (val) => {
        if (!val)
          return [];
        return Array.isArray(val) ? val : [val];
      },
      z.array(z.string()),
    )
    .optional(),
  timePerTurn: z.coerce.number().int().min(1),
});

export const questionBatchQuery = z.object({
  count: z.coerce.number().int().min(1).max(50),
  difficulty: difficultySchema.optional(),
  categoryIds: z
    .preprocess(
      (val) => {
        if (!val)
          return [];
        return Array.isArray(val) ? val : [val];
      },
      z.array(z.string()),
    )
    .optional(),
  excludeIds: z
    .preprocess(
      (val) => {
        if (!val)
          return [];
        return Array.isArray(val) ? val : [val];
      },
      z.array(z.string()),
    )
    .optional(),
  timePerTurn: z.coerce.number().int().min(1),
});

export type QuestionQuery = z.infer<typeof questionQuery>;
export type QuestionBatchQuery = z.infer<typeof questionBatchQuery>;

const successResponseSchema = questionSchema;

const errorResponseSchema = z.object({
  code: z.literal('NO_QUESTIONS_FOUND'),
  message: z.string(),
});

export const getRandomQuestionResponseSchema = z.union([
  successResponseSchema,
  errorResponseSchema,
]);

export type GetRandomQuestionResponse = z.infer<
  typeof getRandomQuestionResponseSchema
>;

export const getBatchQuestionsResponseSchema = z.object({
  questions: z.array(questionSchema),
});

export type GetBatchQuestionsResponse = z.infer<
  typeof getBatchQuestionsResponseSchema
>;
