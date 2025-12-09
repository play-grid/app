import z from 'zod';


// Schemas for API routes
export const LocaleRecordSchema = z.object({
  en: z.string(),
  ar: z.string(),
});
export type LocaleRecord = z.infer<typeof LocaleRecordSchema>;

export const LogoListResponseSchema = z.object({
  id: z.string(),
  name: LocaleRecordSchema,
  teamsCount: z.number().optional(),
});
export type LogoListResponse = z.infer<typeof LogoListResponseSchema>;

export const LogoQuerySchema = z.object({
  count: z.string().optional().default('48'),
  language: z.string().optional().default('en'),
  shuffle: z.string().optional().default('true').transform(v => v === 'true'),
});
export type LogoQuery = z.infer<typeof LogoQuerySchema>;
