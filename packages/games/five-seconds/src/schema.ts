import { z } from 'zod';

export const difficultySchema = z.enum(['easy', 'medium', 'hard', 'all']);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
});

export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  categoryId: z.string(),
  difficulty: difficultySchema,
  estimatedReadingTime: z.string().optional(),
  metadata: z.record(z.any(), z.any()).optional(),
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type Category = z.infer<typeof categorySchema>;
export type Question = z.infer<typeof questionSchema>;
