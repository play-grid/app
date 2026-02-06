import z from 'zod';
import { localeRecordSchema } from './i18n';

export const BaseGameMetaSchema = z.object({
  id: z.string(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  minPlayers: z.number().int().min(1),
  maxPlayers: z.number().int().min(1),
  imageUrl: z.url().optional(),
  tags: z.array(z.string()).optional(),
  author: z.string().optional(),
});

export const GameMetaSchema = BaseGameMetaSchema.extend({
  name: localeRecordSchema,
  description: localeRecordSchema.optional(),
});

export const LocalizedGameMetaSchema = BaseGameMetaSchema.extend({
  name: z.string(),
  description: z.string().optional(),
});

export type GameMeta = z.infer<typeof GameMetaSchema>;
export type LocalizedGameMeta = z.infer<typeof LocalizedGameMetaSchema>;

export const difficultySchema = z.enum(['all', 'easy', 'medium', 'hard']);
export const DBDifficultySchema = z.enum(['easy', 'medium', 'hard']);

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

export type Difficulty = z.infer<typeof difficultySchema>;
export type DBDifficulty = z.infer<typeof DBDifficultySchema>;
export type Question = z.infer<typeof baseQuestionSchema>;
