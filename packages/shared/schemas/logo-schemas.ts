import { z } from 'zod';

// Logo set enum
export const logoSetSchema = z.enum(['companies', 'countries', 'movies', 'sports']);

// Logo response schema
export const logoItemSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
});

export const localeRecordSchema = z.object({
  en: z.string(),
  ar: z.string(),
});
export const languageQuery = z.object({ language: z.enum(['en', 'ar'], { error: 'Language not supported' }).default('en') });

// Logo list schema
export const logoListSchema = z.object({
  id: z.string(),
  name: localeRecordSchema,
});

// Query parameters schema
export const logoQuerySchema = z.object({
  count: z.string().optional().default('48'),
  language: z.string().optional().default('en'),
  shuffle: z.string().optional().default('true').transform(v => v === 'true'),
});
