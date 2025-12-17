import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { GameSessionManager } from '../game-session.manager';

describe('gameSessionManager', () => {
  let manager: GameSessionManager;
  let mockCtx: any;
  let mockGameDefinition: any;

  beforeEach(() => {
    mockCtx = {
      storage: {
        put: vi.fn().mockResolvedValue(undefined),
        get: vi.fn().mockResolvedValue(null),
      },
      blockConcurrencyWhile: vi.fn(async fn => fn()),
      getWebSockets: vi.fn().mockReturnValue([]),
    };

    const initialState = {
      players: {},
      phase: 'lobby',
    };

    mockGameDefinition = {
      name: 'test-game',
      stateSchema: z.object({
        players: z.record(z.any(), z.any()),
        phase: z.string(),
      }),
      actionSchema: z.object({
        type: z.string(),
        payload: z.any().optional(),
      }),
      reducer: (state: any, action: any) => {
        if (action.type === 'ADD_PLAYER') {
          return {
            ...state,
            players: {
              ...state.players,
              [action.payload.id]: {
                id: action.payload.id,
                name: action.payload.name,
                score: 0,
              },
            },
          };
        }
        return state;
      },
      initialState,
    };

    manager = new GameSessionManager({
      gameDefinition: mockGameDefinition,
      initialState: mockGameDefinition.initialState,
      ctx: mockCtx,
      effectHandlers: [],
      apiUrl: 'http://localhost:8787',
    });
  });

  describe('dispatchAction', () => {
    it('should validate action against schema', async () => {
      const invalidAction = { type: 123 }; // Should be string

      await expect(
        manager.dispatchAction(invalidAction),
      ).rejects.toThrow();
    });

    it('should run the reducer and update state', async () => {
      const action = {
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      };

      await manager.dispatchAction(action);

      const state = manager.getState();
      expect(state.players.p1).toEqual({
        id: 'p1',
        name: 'Player 1',
        score: 0,
      });
    });

    it('should persist state to storage', async () => {
      const action = {
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      };

      await manager.dispatchAction(action);

      expect(mockCtx.storage.put).toHaveBeenCalledWith(
        'state',
        expect.objectContaining({
          players: expect.objectContaining({
            p1: expect.any(Object),
          }),
        }),
      );
    });

    it('should broadcast state to all connected WebSockets', async () => {
      const mockWs1 = { send: vi.fn() };
      const mockWs2 = { send: vi.fn() };

      mockCtx.getWebSockets.mockReturnValue([mockWs1, mockWs2]);

      const action = {
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      };

      await manager.dispatchAction(action);

      expect(mockWs1.send).toHaveBeenCalled();
      expect(mockWs2.send).toHaveBeenCalled();

      const broadcastMessage = JSON.parse(mockWs1.send.mock.calls[0][0]);
      expect(broadcastMessage.type).toBe('onStateUpdate');
      expect(broadcastMessage.payload.players.p1).toBeDefined();
    });

    it('should rollback state if new state is invalid', async () => {
      const oldState = manager.getState();

      // Create a schema that will reject the new state after adding a player
      // The new state will have a player, but we'll require players to be empty
      mockGameDefinition.stateSchema = z.object({
        players: z.record(z.any(), z.any()).refine(
          players => Object.keys(players).length === 0,
          { message: 'Players must be empty' },
        ),
        phase: z.string(),
      });

      const action = {
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      };

      // The reducer will add a player, but the schema requires empty players
      // So validation should fail
      await expect(
        manager.dispatchAction(action),
      ).rejects.toThrow();

      // State should be rolled back to original
      expect(manager.getState()).toEqual(oldState);
    });
  });

  describe('executeEffects', () => {
    it('should execute registered effect handlers', async () => {
      const mockEffect = vi.fn().mockResolvedValue(null);

      const managerWithEffects = new GameSessionManager({
        gameDefinition: mockGameDefinition,
        initialState: mockGameDefinition.initialState,
        ctx: mockCtx,
        effectHandlers: [mockEffect],
        apiUrl: 'http://localhost:8787',
      });

      const action = { type: 'TEST_ACTION' };

      await managerWithEffects.dispatchAction(action);

      expect(mockEffect).toHaveBeenCalledWith(
        expect.objectContaining({
          action,
          state: expect.any(Object),
        }),
      );
    });

    it('should dispatch follow-up actions returned by effects', async () => {
      const followUpAction = { type: 'FOLLOW_UP', payload: {} };
      let effectCalled = false;

      const mockEffect = vi.fn().mockImplementation(async () => {
        if (!effectCalled) {
          effectCalled = true;
          return followUpAction;
        }
        return null; // Don't return action on second call
      });

      // Create a reducer that handles both actions
      mockGameDefinition.reducer = (state: any) => {
        return state; // Just return state unchanged
      };

      const managerWithEffects = new GameSessionManager({
        gameDefinition: mockGameDefinition,
        initialState: mockGameDefinition.initialState,
        ctx: mockCtx,
        effectHandlers: [mockEffect],
        apiUrl: 'http://localhost:8787',
      });

      const action = { type: 'TRIGGER_EFFECT' };

      await managerWithEffects.dispatchAction(action);

      // Effect should have been called multiple times:
      // 1st call: for TRIGGER_EFFECT action
      // 2nd call: for FOLLOW_UP action (the follow-up)
      expect(mockEffect.mock.calls.length).toBe(2);

      // First call should be for original action
      expect(mockEffect.mock.calls[0][0].action.type).toBe('TRIGGER_EFFECT');

      // Second call should be for follow-up action
      expect(mockEffect.mock.calls[1][0].action.type).toBe('FOLLOW_UP');
    });

    it('should handle effect errors gracefully', async () => {
      const mockEffect = vi
        .fn()
        .mockRejectedValue(new Error('Effect failed'));

      const managerWithEffects = new GameSessionManager({
        gameDefinition: mockGameDefinition,
        initialState: mockGameDefinition.initialState,
        ctx: mockCtx,
        effectHandlers: [mockEffect],
        apiUrl: 'http://localhost:8787',
      });

      const action = { type: 'TEST_ACTION' };

      // Should not throw, just log error
      await expect(
        managerWithEffects.dispatchAction(action),
      ).resolves.not.toThrow();
    });

    it('should throw an error if dispatch depth is exceeded', async () => {
      const mockEffect = vi.fn().mockImplementation(async () => {
        // Always return a new action to trigger a loop
        return { type: 'RECURSIVE_ACTION' };
      });

      mockGameDefinition.reducer = (state: any) => {
        return state;
      };

      const managerWithEffects = new GameSessionManager({
        gameDefinition: mockGameDefinition,
        initialState: mockGameDefinition.initialState,
        ctx: mockCtx,
        effectHandlers: [mockEffect],
        apiUrl: 'http://localhost:8787',
      });

      const action = { type: 'START_LOOP_ACTION' };

      // Expect the dispatch to reject with the max depth error
      await expect(
        managerWithEffects.dispatchAction(action),
      ).rejects.toThrow('Max dispatch depth exceeded');
    });
  });

  describe('state persistence and rehydration', () => {
    it('should persist state after each action', async () => {
      const action = {
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      };

      await manager.dispatchAction(action);

      expect(mockCtx.storage.put).toHaveBeenCalledWith(
        'state',
        expect.any(Object),
      );
    });

    it('should maintain state across multiple actions', async () => {
      const action1 = {
        type: 'ADD_PLAYER',
        payload: { id: 'p1', name: 'Player 1' },
      };
      const action2 = {
        type: 'ADD_PLAYER',
        payload: { id: 'p2', name: 'Player 2' },
      };

      await manager.dispatchAction(action1);
      await manager.dispatchAction(action2);

      const finalState = manager.getState();
      expect(Object.keys(finalState.players)).toHaveLength(2);
      expect(finalState.players.p1).toBeDefined();
      expect(finalState.players.p2).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const state = manager.getState();
      expect(state).toEqual({
        players: {},
        phase: 'lobby',
      });
    });
  });
});
