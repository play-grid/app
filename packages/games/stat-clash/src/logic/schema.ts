import type { GameStatItem } from '@guess-logo/data-pipeline';
import { BaseGameStateSchema } from '@guess-logo/game-core';
import { z } from 'zod';

export const StatClashSettingsSchema = z.object({
  mode: z.enum(['solo', 'hotseat', 'screen', 'remote']),
  category: z.enum(['football', 'companies', 'countries', 'mixed']),
  metricType: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  timeLimit: z.number().optional(),
  streakGoal: z.number().optional(),
  roundsPerPlayer: z.number().default(10),
});

export type StatClashSettings = z.infer<typeof StatClashSettingsSchema>;

export const StatClashRoundSchema = z.object({
  leftItem: z.object({
    id: z.string(),
    name: z.string(),
    nameAr: z.string().nullable(),
    value: z.number(),
    unit: z.string(),
    unitAr: z.string().nullable(),
    imageUrl: z.string().nullable(),
    hint: z.string().nullable(),
    hintAr: z.string().nullable(),
    entity: z.string(),
  }),
  rightItem: z.object({
    id: z.string(),
    name: z.string(),
    nameAr: z.string().nullable(),
    value: z.number(),
    unit: z.string(),
    unitAr: z.string().nullable(),
    imageUrl: z.string().nullable(),
    hint: z.string().nullable(),
    hintAr: z.string().nullable(),
    entity: z.string(),
  }),
  higherSide: z.enum(['left', 'right']),
  revealed: z.boolean().default(false),
});

export type StatClashRound = z.infer<typeof StatClashRoundSchema>;

export const StatClashHistoryItemSchema = z.object({
  leftItemName: z.string(),
  rightItemName: z.string(),
  guessedDirection: z.enum(['left', 'right']),
  correctDirection: z.enum(['left', 'right']),
  wasCorrect: z.boolean(),
});

export type StatClashHistoryItem = z.infer<typeof StatClashHistoryItemSchema>;

export const StatClashGameStateSchema = BaseGameStateSchema.extend({
  settings: StatClashSettingsSchema,
  playerOrder: z.array(z.string()).default([]),
  currentPlayerId: z.string().nullable().default(null),
  currentRound: StatClashRoundSchema.nullable().default(null),
  recentRounds: z.array(StatClashHistoryItemSchema).default([]),
  availableItems: z.array(z.custom<GameStatItem>()).default([]),
  usedItemIds: z.array(z.string()).default([]),
  error: z.object({
    message: z.string(),
    canRetry: z.boolean(),
  }).nullable().default(null),
  lastActivityAt: z.number(),
});

export type StatClashGameState = z.infer<typeof StatClashGameStateSchema>;

export const StartGameActionSchema = z.object({
  type: z.literal('START_GAME'),
  payload: StatClashSettingsSchema,
});

export const RequestStatItemsActionSchema = z.object({
  type: z.literal('REQUEST_STAT_ITEMS'),
  payload: z.object({
    category: z.string().optional(),
    metricType: z.string().optional(),
    limit: z.number().optional(),
  }),
});

export const StatItemsFetchedActionSchema = z.object({
  type: z.literal('STAT_ITEMS_FETCHED'),
  payload: z.object({
    items: z.array(z.any()),
    error: z.string().optional(),
  }),
});

export const GuessHigherActionSchema = z.object({
  type: z.literal('GUESS_HIGHER'),
  payload: z.object({
    direction: z.enum(['left', 'right']),
    playerId: z.string(),
  }),
});

export const StatClashErrorActionSchema = z.object({
  type: z.literal('STAT_CLASH_ERROR'),
  payload: z.object({
    message: z.string(),
    canRetry: z.boolean(),
  }),
});

export const AddHotseatPlayerActionSchema = z.object({
  type: z.literal('ADD_HOTSEAT_PLAYER'),
  payload: z.object({ name: z.string() }),
});

export const RemoveHotseatPlayerActionSchema = z.object({
  type: z.literal('REMOVE_HOTSEAT_PLAYER'),
  payload: z.object({ playerId: z.string() }),
});

export const StatClashCustomActionSchema = z.discriminatedUnion('type', [
  StartGameActionSchema,
  RequestStatItemsActionSchema,
  StatItemsFetchedActionSchema,
  GuessHigherActionSchema,
  StatClashErrorActionSchema,
  AddHotseatPlayerActionSchema,
  RemoveHotseatPlayerActionSchema,
]);

export const StatClashActionSchema = z.discriminatedUnion('type', [
  ...StatClashCustomActionSchema.options,
]);

export type StatClashAction = z.infer<typeof StatClashActionSchema>;

export type StartGameAction = z.infer<typeof StartGameActionSchema>;
export type RequestStatItemsAction = z.infer<typeof RequestStatItemsActionSchema>;
export type StatItemsFetchedAction = z.infer<typeof StatItemsFetchedActionSchema>;
export type GuessHigherAction = z.infer<typeof GuessHigherActionSchema>;
export type StatClashErrorAction = z.infer<typeof StatClashErrorActionSchema>;
export type AddHotseatPlayerAction = z.infer<typeof AddHotseatPlayerActionSchema>;
export type RemoveHotseatPlayerAction = z.infer<typeof RemoveHotseatPlayerActionSchema>;
