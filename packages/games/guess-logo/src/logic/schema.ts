import { BaseGameStateSchema, GameActionSchema, PlayerSchema } from '@guess-logo/game-core';
import z from 'zod';
import { LogoContentSchema, LogoSetKeySchema } from '../base.schema';

export const GuessLogoSettingsSchema = z.object({
  logoSetKey: LogoSetKeySchema,
  listId: z.string(),
  gridSize: z.enum(['4x3', '6x4', '8x6', '10x8']),
  language: z.enum(['en', 'ar']),
  logoCount: z.number().int().min(12).max(80),
});

export type GuessLogoSettings = z.infer<typeof GuessLogoSettingsSchema>;

export const GuessLogoPlayerMetadataSchema = z.object({
  eliminatedLogoIds: z.array(z.number()).default([]),
  secretLogoId: z.number().optional(),
  winningLogoId: z.number().optional(),
});
export type GuessLogoPlayerMetadata = z.infer<typeof GuessLogoPlayerMetadataSchema>;

// GAME STATE
export const GuessLogoGameStateSchema = BaseGameStateSchema.extend({
  settings: GuessLogoSettingsSchema,
  players: z.record(z.string(), PlayerSchema),
  logos: z.array(LogoContentSchema).default([]),
  isContentLoaded: z.boolean().default(false),
});

export type GuessLogoGameState = z.infer<typeof GuessLogoGameStateSchema>;

// GAME ACTIONS

export const EliminateLogoActionSchema = z.object({
  type: z.literal('ELIMINATE_LOGO'),
  payload: z.object({
    playerId: z.string(),
    logoId: z.number(),
  }),
});

export const RestoreLogoActionSchema = z.object({
  type: z.literal('RESTORE_LOGO'),
  payload: z.object({
    playerId: z.string(),
    logoId: z.number(),
  }),
});

export const ShuffleLogosActionSchema = z.object({
  type: z.literal('SHUFFLE_LOGOS'),
  payload: z.object({
    logos: z.array(LogoContentSchema),
  }),
});

export const LoadContentActionSchema = z.object({
  type: z.literal('LOAD_CONTENT'),
  payload: z.object({
    logos: z.array(LogoContentSchema),
  }),
});

export const CheckWinnerActionSchema = z.object({
  type: z.literal('CHECK_WINNER'),
  payload: z.object({
    playerId: z.string(),
  }),
});

export const GuessLogoCustomActionSchema = z.discriminatedUnion('type', [
  LoadContentActionSchema,
  EliminateLogoActionSchema,
  RestoreLogoActionSchema,
  CheckWinnerActionSchema,
  ShuffleLogosActionSchema,
]);

export const GuessLogoActionSchema = z.discriminatedUnion('type', [
  ...GameActionSchema.options,
  ...GuessLogoCustomActionSchema.options,
]);

export type LoadContentAction = z.infer<typeof LoadContentActionSchema>;
export type EliminateLogoAction = z.infer<typeof EliminateLogoActionSchema>;
export type RestoreLogoAction = z.infer<typeof RestoreLogoActionSchema>;
export type CheckWinnerAction = z.infer<typeof CheckWinnerActionSchema>;
export type ShuffleLogosAction = z.infer<typeof ShuffleLogosActionSchema>;
export type GuessLogoAction = z.infer<typeof GuessLogoActionSchema>;
