import { difficultySchema, questionSchema as fiveSecondsQuestionSchema } from '@guess-logo/five-seconds';
import z from 'zod';

export const questionSchema = fiveSecondsQuestionSchema.extend({
  estimatedReadingTime: z.string(),
  exampleAnswers: z.string().optional(),
  metadata: z.preprocess(
    (val) => {
      if (!val)
        return {};
      if (typeof val === 'string') {
        try {
          return JSON.parse(val);
        }
        catch {
          return {};
        }
      }
      return val;
    },
    z.record(z.string(), z.string()),
  ).optional(),
  categoryId: z.string(),
});

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
});
