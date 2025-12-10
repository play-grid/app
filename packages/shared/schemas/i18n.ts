import z from 'zod';

export const localeRecordSchema = z.object({
  en: z.string(),
  ar: z.string(),
});

export const languageQuery = z.object({ language: z.enum(['en', 'ar'], { error: 'Language not supported' }).default('en') });
