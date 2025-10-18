import { z } from 'zod';

export const difficultySchema = z.enum(['easy', 'medium', 'hard']);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
});

export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  categoryIds: z.array(z.string()),
  difficulty: difficultySchema,
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type Category = z.infer<typeof categorySchema>;
export type Question = z.infer<typeof questionSchema>;
