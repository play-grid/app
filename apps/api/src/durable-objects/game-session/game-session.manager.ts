/* eslint-disable no-console */
import type { BaseGameStateWire, GameDefinition } from '@guess-logo/game-core';
import { encodeHibernationRPCEvent } from '@orpc/server/hibernation';

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
      // Parse and validate initial state against schema
      this.currentState = config.gameDefinition.stateSchema.parse(
        config.initialState,
      );
      console.log('[GameSessionManager] Initial state validated successfully:', JSON.stringify(this.currentState, null, 2));
    }
    catch (error) {
      console.error('[GameSessionManager] Initial state validation failed:', error);
      throw error;
    }

    this.gameDefinition = config.gameDefinition;
    this.ctx = config.ctx;
  }

  getState(): BaseGameStateWire {
    try {
      const state = this.currentState;
      console.log('[GameSessionManager] Getting state:', JSON.stringify(state, null, 2));

      // Validate state before returning
      const validated = this.gameDefinition.stateSchema.parse(state);
      console.log('[GameSessionManager] State validation passed');
      return validated;
    }
    catch (error) {
      console.error('[GameSessionManager] State validation error:', error);
      throw error;
    }
  }

  /**
   * Dispatch an action - accepts any and validates internally
   */
  dispatchAction(action: any): void {
    try {
      const validatedAction = this.gameDefinition.actionSchema.parse(action);
      const newState = this.gameDefinition.reducer(
        this.currentState,
        validatedAction,
      );
      const validatedState = this.gameDefinition.stateSchema.parse(newState);

      this.currentState = validatedState;
      this.broadcastState();
    }
    catch (error) {
      console.error('[GameSessionManager] Action dispatch failed:', error);
      throw error;
    }
  }

  private broadcastState(): void {
    const websockets = this.ctx.getWebSockets();

    for (const ws of websockets) {
      try {
        const attachment = ws.deserializeAttachment();
        if (typeof attachment !== 'object' || attachment === null) {
          continue;
        }

        const { id } = attachment as { id?: string };
        if (!id) {
          continue;
        }

        ws.send(
          encodeHibernationRPCEvent(id, this.currentState),
        );
      }
      catch (error) {
        console.error('[GameSessionManager] Broadcast error:', error);
      }
    }
  }

  reset(): void {
    this.currentState = this.gameDefinition.stateSchema.parse(
      this.gameDefinition.initialState,
    );
    this.broadcastState();
  }
}
