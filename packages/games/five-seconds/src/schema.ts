import type { DBDifficulty, Difficulty, Question } from '@guess-logo/shared/schemas';
import {
  baseQuestionSchema,
  categoryBaseSchema,

  DBDifficultySchema,

  difficultySchema,

} from '@guess-logo/shared/schemas';
import { z } from 'zod';

export {
  baseQuestionSchema,
  categoryBaseSchema,
  type DBDifficulty,
  DBDifficultySchema,
  type Difficulty,
  difficultySchema,
  type Question,
};

export const questionWithCategorySchema = baseQuestionSchema.extend({
  categoryNameEn: z.string().optional(),
  categoryNameAr: z.string().optional(),
});

export type QuestionWithCategory = z.infer<typeof questionWithCategorySchema>;
