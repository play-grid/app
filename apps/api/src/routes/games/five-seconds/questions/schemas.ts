import z from 'zod';

export const question = z.object({
  question: z.string(),
  estimatedReadingTime: z.string(),
  exampleAnswers: z.string(),
  category: z.string(),
  difficulty: z.string(),
  metadata: z.record(z.string(), z.string()),
});

export const questionQuery = z.object({
  packId: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  category: z.string(),
  excludeIds: z.array(z.string()).optional(),
});
