import { z } from 'zod';

// Logo set enum
export const logoSetSchema = z.enum(['companies', 'countries', 'movies', 'sports']);

// Logo response schema
export const logoItemSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
});

// Logo list schema
export const logoListSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// Query parameters schema
export const logoQuerySchema = z.object({
  count: z.string().optional().default('48'),
  language: z.string().optional().default('en'),
});
