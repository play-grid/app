import z from 'zod';

export const localeRecordSchema = z.object({
  en: z.string(),
  ar: z.string(),
});
