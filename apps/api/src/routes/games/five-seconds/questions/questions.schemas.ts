import { baseQuestionSchema } from '@playgrid/shared/schemas';
import { z } from 'zod';

const parseStringArray = z
  .union([z.string(), z.array(z.string())])
  .transform((val) => {
    if (Array.isArray(val))
      return val;
    if (typeof val === 'string' && val.length === 0)
      return [];
    return val.split(',').filter(Boolean);
  });

export const getRandomQuestionQuerySchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard', 'all']).optional(),
  categoryIds: parseStringArray.optional().default([]),
  excludeIds: parseStringArray.optional().default([]),
  timePerTurn: z.coerce.number().int().positive(),
});

export const getBatchQuestionsQuerySchema = z.object({
  count: z.coerce.number().int().positive().max(100),
  difficulty: z.enum(['easy', 'medium', 'hard', 'all']).optional(),
  categoryIds: parseStringArray.optional().default([]),
  excludeIds: parseStringArray.optional().default([]),
  timePerTurn: z.coerce.number().int().positive(),
});

export const questionResponseSchema = baseQuestionSchema;

export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type GetRandomQuestionQuery = z.infer<typeof getRandomQuestionQuerySchema>;
export type GetBatchQuestionsQuery = z.infer<typeof getBatchQuestionsQuerySchema>;
