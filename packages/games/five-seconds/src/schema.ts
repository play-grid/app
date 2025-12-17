import { z } from 'zod';

export const difficultySchema = z.enum(['easy', 'medium', 'hard', 'all']);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
});

export const baseQuestionSchema = z.object({
  id: z.string(),
  text: z.string(),
  difficulty: difficultySchema,
  categoryId: z.string(),
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type Category = z.infer<typeof categorySchema>;
export type Question = z.infer<typeof baseQuestionSchema>;
