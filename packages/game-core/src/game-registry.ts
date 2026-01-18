// packages/game-core/src/game-registry.ts
import type { z } from 'zod';
import type { BaseAction, GameDefinition, GameMeta } from './contracts/game-definition';
import type { EffectHandlerFactory, GameEffect } from './contracts/game-effects';
import type { BaseGameState } from './game-logic/schema/state.types';
import { createGameContract } from './adapters/multiplayer/contracts/base.contract';
import { logger } from './utils/logger';

/**
 * Internal representation of a registered game
 * Combines the pure game definition with its effect handlers
 */
interface RegisteredGame<
  TStateSchema extends z.ZodType<BaseGameState>,
  TActionSchema extends z.ZodType<BaseAction>,
> {
  definition: GameDefinition<TStateSchema, TActionSchema>;
  contract: ReturnType<typeof createGameContract<TStateSchema, TActionSchema>>;
  effectHandlerFactory: EffectHandlerFactory;
}

const gameRegistry = new Map<string, RegisteredGame<any, any>>();

/**
 * Register a game with the platform
 *
 * @param definition - Pure game definition (state machine only)
 * @param effectHandlerFactory - Optional factory for creating effect handlers
 *
 * @example
 * registerGame(fiveSecondsDefinition, (apiUrl) => [
 *   createFetchQuestionsEffect(apiUrl),
 *   createSaveScoreEffect(apiUrl),
 * ]);
 */
export function registerGame<
  TStateSchema extends z.ZodType<BaseGameState>,
  TActionSchema extends z.ZodType<BaseAction>,
>(
  definition: GameDefinition<TStateSchema, TActionSchema>,
  effectHandlerFactory: EffectHandlerFactory = (_apiUrl, _mode) => [],
): void {
  const gameId = definition.meta.id;

  if (gameRegistry.has(gameId)) {
    logger.warn(`Game "${gameId}" already registered. Overwriting.`);
  }

  const contract = createGameContract({
    stateSchema: definition.stateSchema,
    actionSchema: definition.actionSchema,
  });

  gameRegistry.set(gameId, {
    definition,
    contract,
    effectHandlerFactory,
  });

  logger.info(`✅ Game registered: ${gameId} v${definition.meta.version}`);
}

/**
 * Get the complete registered game (definition + handlers)
 */
export function getGame(
  gameId: string,
): RegisteredGame<any, any> | undefined {
  return gameRegistry.get(gameId);
}

/**
 * Get only the game definition (pure state machine)
 */
export function getGameDefinition(
  gameId: string,
): GameDefinition<any, any> | undefined {
  return gameRegistry.get(gameId)?.definition;
}

/**
 * Get the game contract for API communication
 */
export function getGameContract(gameId: string): any {
  return gameRegistry.get(gameId)?.contract;
}

/**
 * Create effect handlers for a specific game
 * This is called by the Durable Object at runtime
 *
 * @param gameId - The game to create handlers for
 * @param apiUrl - API URL for dependency injection
 * @returns Array of effect handler functions
 */
export function createGameEffectHandlers(
  gameId: string,
  apiUrl: string,
  mode?: 'local' | 'multiplayer',
): GameEffect[] {
  const registered = gameRegistry.get(gameId);
  if (!registered) {
    logger.warn(`No game found for ID: ${gameId}, returning empty effect handlers`);
    return [];
  }

  const handlers = registered.effectHandlerFactory(apiUrl, mode);
  logger.debug(`Created ${handlers.length} effect handler(s) for game: ${gameId} in ${mode} mode`);
  return handlers;
}

/**
 * Get effect handlers for a game (alias for createGameEffectHandlers)
 * @deprecated Use createGameEffectHandlers instead
 */
export function getGameEffectHandlers(
  gameId: string,
  apiUrl: string,
): GameEffect[] | undefined {
  return createGameEffectHandlers(gameId, apiUrl);
}

/**
 * Get all registered game IDs
 */
export function getRegisteredGameIds(): string[] {
  return Array.from(gameRegistry.keys());
}

/**
 * Get metadata for all registered games
 */
export function getRegisteredGamesMeta(): GameMeta[] {
  return Array.from(gameRegistry.values()).map(g => g.definition.meta);
}

/**
 * Check if a game is registered
 */
export function isGameRegistered(gameId: string): boolean {
  return gameRegistry.has(gameId);
}

/**
 * Verify games are loaded at startup
 * Logs a warning if no games are registered
 */
export function ensureGamesLoaded(): void {
  const ids = getRegisteredGameIds();
  if (ids.length === 0) {
    logger.warn('⚠️ No games registered yet! Make sure game modules are imported at application entry point.');
  }
  else {
    logger.info(`🎮 Currently registered games: ${ids.join(', ')}`);
  }
}
