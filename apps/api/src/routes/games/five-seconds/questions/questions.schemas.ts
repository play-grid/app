import { difficultySchema, questionSchema as fiveSecondsQuestionSchema } from '@guess-logo/shared/schemas/five-seconds';
import z from 'zod';

export const questionSchema = fiveSecondsQuestionSchema.extend({
  estimatedReadingTime: z.string(), // this calculated dynamically
  exampleAnswers: z.string(),
  metadata: z.record(z.string(), z.string()),
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
