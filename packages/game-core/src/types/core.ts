import type { z } from 'zod';
import { BaseGameStateSchema, PlayerSchema } from '../game-logic/schema/state';

export interface GameStoreOptions {
  maxPlayers?: number;
  minPlayers?: number;
  turnBased?: boolean;
  requireReady?: boolean;
}

export function createGameStateSchema<TSettings extends z.ZodType>(
  settingsSchema: TSettings,
) {
  return BaseGameStateSchema.extend({
    settings: settingsSchema,
  });
}

export function createPlayerSchema<TExtensions extends z.ZodRawShape>(
  extensions: TExtensions,
) {
  return PlayerSchema.extend(extensions);
}
