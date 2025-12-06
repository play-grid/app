/* eslint-disable no-console */
import type { BaseGameStateWire, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';
import { ZodError } from 'zod';
import { logger } from '@/utils/logger';

export interface GameSessionManagerConfig {
  gameDefinition: GameDefinition<any, any>;
  initialState: Partial<BaseGameStateWire>;
  ctx: DurableObjectState;
}

export class GameSessionManager {
  private currentState: BaseGameStateWire;
  private gameDefinition: GameDefinition<any, any>;
  private ctx: DurableObjectState;

  constructor(config: GameSessionManagerConfig) {
    try {
      this.currentState = config.gameDefinition.stateSchema.parse(
        config.initialState,
      );
    }
    catch (error) {
      logger.error(error, '[GameSessionManager] Initial state validation failed:');
      throw error;
    }

    this.gameDefinition = config.gameDefinition;
    this.ctx = config.ctx;
  }

  getState(): BaseGameStateWire {
    return this.currentState;
  }

  // TODO make these logs so deep in logger
  dispatchAction(action: any): void {
    logger.debug(`[GameSessionManager] Dispatching action: ${action?.type}`);
    logger.debug({ action }, '[GameSessionManager] Action payload (raw):');

    let validatedAction: z.infer<typeof this.gameDefinition.actionSchema>;
    try {
      validatedAction = this.gameDefinition.actionSchema.parse(action);
    }
    catch (error) {
      if (error instanceof ZodError) {
        logger.error(error.issues, `[GameSessionManager] Zod validation failed for action ${action?.type || 'unknown'}:`);
        throw new Error(`Action validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
      }
      logger.error(error, `[GameSessionManager] Unexpected error during action validation ${action?.type || 'unknown'}`);
      throw error;
    }

    logger.debug(validatedAction, '[GameSessionManager] Action payload (validated and parsed):');

    const oldState = this.currentState;
    let newState;
    try {
      newState = this.gameDefinition.reducer(
        this.currentState,
        validatedAction,
      );
    }
    catch (reducerError) {
      logger.error(reducerError, `[GameSessionManager] Error in game reducer for action ${validatedAction.type}:`);
      throw new Error(`Reducer error: ${reducerError instanceof Error ? reducerError.message : 'unknown'}`);
    }

    try {
      this.currentState = this.gameDefinition.stateSchema.parse(newState);
    }
    catch (error) {
      if (error instanceof ZodError) {
        logger.error(error.issues, `[GameSessionManager] Zod validation failed for NEW state after action ${validatedAction.type}:`);

        this.currentState = oldState;
        throw new Error(`New state validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
      }
      logger.error(error, `[GameSessionManager] Unexpected error during new state validation ${validatedAction.type}:`);
      throw error;
    }

    logger.debug(oldState.players, '[GameSessionManager] State BEFORE action:');
    logger.debug(this.currentState.players, '[GameSessionManager] State AFTER action:');

    this.ctx.blockConcurrencyWhile(async () => {
      await this.ctx.storage.put('state', this.currentState);
    });

    this.broadcastState();
  }

  private broadcastState(): void {
    const websockets = this.ctx.getWebSockets();
    logger.debug(`[GameSessionManager] Broadcasting state to ${websockets.length} clients. Current player count: ${Object.keys(this.currentState.players).length}`);

    const message = JSON.stringify({
      type: 'onStateUpdate',
      payload: this.currentState,
    });

    for (const ws of websockets) {
      try {
        ws.send(message);
      }
      catch (error) {
        logger.error(error, '[GameSessionManager] Broadcast error:');
      }
    }
  }

  reset(): void {
    this.currentState = this.gameDefinition.stateSchema.parse(
      this.gameDefinition.initialState,
    );

    this.ctx.storage.put('state', this.currentState);

    this.broadcastState();
  }
}
