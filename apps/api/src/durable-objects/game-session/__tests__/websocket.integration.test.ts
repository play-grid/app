import { getGameDefinition } from '@guess-logo/game-core';
import { describe, expect, it } from 'vitest';
import { GameSessionManager } from '../game-session.manager';
import '../../../games';

describe('validator End-to-End Integration', () => {
  let manager: GameSessionManager;

  beforeEach(async () => {
    const mockCtx = {
      storage: {
        put: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(null),
      },
      blockConcurrencyWhile: vi.fn(async fn => fn()),
      getWebSockets: vi.fn().mockReturnValue([]),
    };

    const gameDefinition = getGameDefinition('five-seconds');
    expect(gameDefinition).toBeDefined();

    manager = new GameSessionManager({
      gameDefinition: gameDefinition!,
      initialState: gameDefinition!.initialState,
      ctx: mockCtx as any,
      effectHandlers: [],
      apiUrl: 'http://localhost:8787',
    });
  });

  describe('five Seconds Game Flow with Validation', () => {
    it('should allow valid START_GAME action', async () => {
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      });
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p2', name: 'Player 2' },
      });

      await expect(
        manager.dispatchAction({ type: 'START_GAME' }),
      ).resolves.not.toThrow();

      const state = manager.getState();
      expect(state.phase).toBe('playing');
      expect(state.turnState).toBeDefined();
      expect(state.turnState?.playerOrder).toEqual(['p1', 'p2']);
      expect(state.turnState?.currentPlayerId).toBe('p1');
    });

    it('should reject START_TURN from wrong player', async () => {
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      });
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p2', name: 'Player 2' },
      });
      await manager.dispatchAction({ type: 'START_GAME' });

      await expect(
        manager.dispatchAction({ type: 'START_TURN' }, 'p2'),
      ).rejects.toThrow('Action validation failed: Only the current player can start their turn');
    });

    it('should allow START_TURN from correct player', async () => {
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      });
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p2', name: 'Player 2' },
      });
      await manager.dispatchAction({ type: 'START_GAME' });

      await expect(
        manager.dispatchAction({ type: 'START_TURN' }, 'p1'),
      ).resolves.not.toThrow();

      const state = manager.getState();
      expect(state.turnState?.phase).toBe('answering');
    });

    it('should reject SUBMIT_VOTE from wrong voter', async () => {
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      });
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p2', name: 'Player 2' },
      });
      await manager.dispatchAction({ type: 'START_GAME' });
      await manager.dispatchAction({ type: 'START_TURN' }, 'p1');

      await manager.dispatchAction({ type: 'TIMES_UP' });

      await expect(
        manager.dispatchAction({ type: 'SUBMIT_VOTE', payload: { isValid: true } }, 'p1'),
      ).rejects.toThrow('Action validation failed: Not your turn to vote');
    });

    it('should reject actions in wrong phase', async () => {
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      });
      await manager.dispatchAction({
        type: 'ADD_PLAYER',
        payload: { id: 'p2', name: 'Player 2' },
      });
      await manager.dispatchAction({ type: 'START_GAME' });

      await expect(
        manager.dispatchAction({ type: 'SUBMIT_VOTE', payload: { isValid: true } }, 'p2'),
      ).rejects.toThrow('Action validation failed: SUBMIT_VOTE only allowed in voting phase');
    });

    it('should allow core actions without player context', async () => {
      await expect(
        manager.dispatchAction({
          type: 'ADD_PLAYER',
          payload: { id: 'p1', name: 'Player 1' },
        }),
      ).resolves.not.toThrow();

      const state = manager.getState();
      expect(state.players.p1).toBeDefined();
    });
  });
});
