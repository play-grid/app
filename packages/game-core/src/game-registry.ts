// packages/game-core/src/game-registry.ts
import type { z } from 'zod';
import type { BaseAction, GameDefinition, GameMeta } from './contracts/game-definition';
import type { BaseGameStateWire } from './game-logic/schema/state.types';
import { createGameContract } from './adapters/multiplayer/contracts/base.contract';
import { logger } from './utils/logger';

interface RegisteredGame<
  TStateSchema extends z.ZodType<BaseGameStateWire>,
  TActionSchema extends z.ZodType<BaseAction>,
> {
  definition: GameDefinition<TStateSchema, TActionSchema>;
  contract: ReturnType<typeof createGameContract<TStateSchema, TActionSchema>>;
}

const gameRegistry = new Map<string, RegisteredGame<any, any>>();

export function registerGame<
  TStateSchema extends z.ZodType<BaseGameStateWire>,
  TActionSchema extends z.ZodType<BaseAction>,
>(definition: GameDefinition<TStateSchema, TActionSchema>): void {
  const gameId = definition.meta.id;

  if (gameRegistry.has(gameId)) {
    logger.warn(`Game "${gameId}" already registered. Overwriting.`);
  }

  const contract = createGameContract({
    stateSchema: definition.stateSchema,
    actionSchema: definition.actionSchema,
  });

  gameRegistry.set(gameId, { definition, contract });
  logger.info(`✅ Game registered: ${gameId}`);
}

export function getGame(
  gameId: string,
): RegisteredGame<any, any> | undefined {
  return gameRegistry.get(gameId);
}

export function getGameDefinition(
  gameId: string,
): GameDefinition<any, any> | undefined {
  return gameRegistry.get(gameId)?.definition;
}

export function getGameContract(gameId: string): any {
  return gameRegistry.get(gameId)?.contract;
}

export function getRegisteredGameIds(): string[] {
  return Array.from(gameRegistry.keys());
}

export function getRegisteredGamesMeta(): GameMeta[] {
  return Array.from(gameRegistry.values()).map(g => g.definition.meta);
}

export function isGameRegistered(gameId: string): boolean {
  return gameRegistry.has(gameId);
}

export function ensureGamesLoaded(): void {
  const ids = getRegisteredGameIds();
  if (ids.length === 0) {
    logger.warn('⚠️ No games registered yet! Make sure game modules are imported at application entry point.');
  }
  else {
    logger.info(`🎮 Currently registered games: ${ids.join(', ')}`);
  }
}
