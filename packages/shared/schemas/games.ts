import z from 'zod';
import { localeRecordSchema } from './i18n';

export const BaseGameMetaSchema = z.object({
  id: z.string(),
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
