import { z } from 'zod';

export const difficultySchema = z.enum(['all', 'easy', 'medium', 'hard']);
export const DBDifficultySchema = z.enum(['easy', 'medium', 'hard']);

// Base schema (the source of truth)
export const categoryBaseSchema = z.object({
  id: z.string(),
  nameEn: z.string(),
  nameAr: z.string(),
});
export const baseQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(5),
  difficulty: difficultySchema,
  categoryId: z.string(),
  deletedAt: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const questionWithCategorySchema = baseQuestionSchema.extend({
  categoryNameEn: z.string().optional(),
  categoryNameAr: z.string().optional(),
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type DBdifficulty = z.infer<typeof DBDifficultySchema>;
export type Question = z.infer<typeof baseQuestionSchema>;
export type QuestionWithCategory = z.infer<typeof questionWithCategorySchema>;
