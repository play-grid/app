import type { BaseGameState } from './schema/state.types';
import { beforeEach, describe, expect, it } from 'vitest';
import { BASE_INITIAL_STATE } from './initial-state';
import { gameReducer } from './reducer';

describe('game Reducer & Actions Logic', () => {
  let initialState: BaseGameState;

  beforeEach(() => {
    initialState = { ...BASE_INITIAL_STATE };
  });

  describe('player Management', () => {
    it('should add a player and set them as host if they are the first', () => {
      const action = {
        type: 'ADD_PLAYER' as const,
        payload: { id: 'p1', name: 'Mohammed' },
      };
      const state = gameReducer(initialState, action);

      expect(state.players.p1).toBeDefined();
      expect(state.players.p1.isHost).toBe(true);
      expect(state.hostId).toBe('p1');
    });

    it('should migrate host when the current host is removed', () => {
      const stateWithPlayers: BaseGameState = {
        ...initialState,
        players: {
          p1: { id: 'p1', name: 'Mohammed', isHost: true, isReady: true, score: 0 },
          p2: { id: 'p2', name: 'Ali', isHost: false, isReady: true, score: 0 },
        },
        hostId: 'p1',
      };

      const action = { type: 'REMOVE_PLAYER' as const, payload: { playerId: 'p1' } };
      const nextState = gameReducer(stateWithPlayers, action);

      expect(nextState.players.p1).toBeUndefined();
      expect(nextState.hostId).toBe('p2');
      expect(nextState.players.p2.isHost).toBe(true);
    });
  });

  describe('turn State Lifecycle', () => {
    const startedState: BaseGameState = {
      ...BASE_INITIAL_STATE,
      phase: 'playing',
      players: {
        p1: { id: 'p1', name: 'Mohammed', isHost: true, isReady: true, score: 0 },
        p2: { id: 'p2', name: 'Ali', isHost: false, isReady: true, score: 0 },
        p3: { id: 'p3', name: 'Charlie', isHost: false, isReady: true, score: 0 },
      },
      turnState: {
        playerOrder: ['p1', 'p2', 'p3'],
        currentPlayerIndex: 0,
        currentPlayerId: 'p1',
        direction: 'forward',
        roundNumber: 1,
        turnNumber: 0,
        skipsRemaining: 0,
      },
    };

    it('should advance to the next player correctly', () => {
      const action = { type: 'NEXT_TURN' as const, payload: {} };
      const state = gameReducer(startedState, action);

      expect(state.turnState?.currentPlayerId).toBe('p2');
      expect(state.turnState?.turnNumber).toBe(1);
    });

    it('should increment round number and wrap index at end of order', () => {
      const atEndState = {
        ...startedState,
        turnState: { ...startedState.turnState!, currentPlayerIndex: 2, currentPlayerId: 'p3' },
      };
      const state = gameReducer(atEndState, { type: 'NEXT_TURN' as const });

      expect(state.turnState?.currentPlayerId).toBe('p1');
      expect(state.turnState?.roundNumber).toBe(2);
    });

    it('should respect reverse turn direction', () => {
      let state = gameReducer(startedState, { type: 'REVERSE_TURN_DIRECTION' as const });
      state = gameReducer(state, { type: 'NEXT_TURN' as const });

      expect(state.turnState?.currentPlayerId).toBe('p3');
      expect(state.turnState?.direction).toBe('reverse');
    });

    it('should handle player skips', () => {
      let state = gameReducer(startedState, {
        type: 'SKIP_PLAYERS' as const,
        payload: { count: 1 },
      });

      state = gameReducer(state, { type: 'NEXT_TURN' as const });

      expect(state.turnState?.currentPlayerId).toBe('p3');
      expect(state.turnState?.skipsRemaining).toBe(0);
    });
  });

  describe('edge Cases', () => {
    it('should adjust turn index when a player before the current player is removed', () => {
      const midGameState: BaseGameState = {
        ...initialState,
        players: { p1: {} as any, p2: {} as any, p3: {} as any },
        turnState: {
          playerOrder: ['p1', 'p2', 'p3'],
          currentPlayerIndex: 1,
          currentPlayerId: 'p2',
          direction: 'forward',
          roundNumber: 1,
          turnNumber: 2,
          skipsRemaining: 0,
        },
      };

      const action = { type: 'REMOVE_PLAYER' as const, payload: { playerId: 'p1' } };
      const nextState = gameReducer(midGameState, action);

      expect(nextState.turnState?.playerOrder).toEqual(['p2', 'p3']);
      expect(nextState.turnState?.currentPlayerIndex).toBe(0);
      expect(nextState.turnState?.currentPlayerId).toBe('p2');
    });

    it('should handle RESET_GAME by preserving players but resetting game state', () => {
      const stateWithData: BaseGameState = {
        ...initialState,
        players: { p1: { id: 'p1', name: 'Player 1', isHost: true, isReady: true, score: 5 } as any },
        settings: { difficulty: 'hard' },
        phase: 'playing',
      };

      const nextState = gameReducer(stateWithData, { type: 'RESET_GAME' as const });

      expect(Object.keys(nextState.players).length).toBe(1);
      expect(nextState.players.p1.id).toBe('p1');
      expect(nextState.players.p1.name).toBe('Player 1');
      expect(nextState.players.p1.isHost).toBe(true);
      expect(nextState.phase).toBe('lobby');
      expect(nextState.settings.difficulty).toBe('hard');
      expect(nextState.turnState).toBeUndefined();
      expect(nextState.startedAt).toBeUndefined();
      expect(nextState.endedAt).toBeUndefined();
    });
  });
});

describe('edge Case: Player Removal During Play', () => {
  const midGameState: BaseGameState = {
    ...BASE_INITIAL_STATE,
    phase: 'playing',
    players: {
      p1: { id: 'p1', name: 'Mohammed', isHost: true, isReady: true, score: 0 },
      p2: { id: 'p2', name: 'Ali', isHost: false, isReady: true, score: 0 },
      p3: { id: 'p3', name: 'Charlie', isHost: false, isReady: true, score: 0 },
    },
    turnState: {
      playerOrder: ['p1', 'p2', 'p3'],
      currentPlayerIndex: 1,
      currentPlayerId: 'p2',
      direction: 'forward',
      roundNumber: 1,
      turnNumber: 5,
      skipsRemaining: 0,
    },
  };

  it('should shift the index back if a player BEFORE the current player is removed', () => {
    const action = { type: 'REMOVE_PLAYER' as const, payload: { playerId: 'p1' } };
    const state = gameReducer(midGameState, action);

    expect(state.turnState?.playerOrder).toEqual(['p2', 'p3']);
    expect(state.turnState?.currentPlayerIndex).toBe(0);
    expect(state.turnState?.currentPlayerId).toBe('p2');
  });

  it('should keep the same index if the CURRENT player is removed (next person up)', () => {
    const action = { type: 'REMOVE_PLAYER' as const, payload: { playerId: 'p2' } };
    const state = gameReducer(midGameState, action);

    expect(state.turnState?.playerOrder).toEqual(['p1', 'p3']);
    expect(state.turnState?.currentPlayerIndex).toBe(1);
    expect(state.turnState?.currentPlayerId).toBe('p3');
  });

  it('should wrap index to 0 if the CURRENT player was the last in the order', () => {
    const atEndState: BaseGameState = {
      ...midGameState,
      turnState: { ...midGameState.turnState!, currentPlayerIndex: 2, currentPlayerId: 'p3' },
    };

    const action = { type: 'REMOVE_PLAYER' as const, payload: { playerId: 'p3' } };
    const state = gameReducer(atEndState, action);

    expect(state.turnState?.playerOrder).toEqual(['p1', 'p2']);
    expect(state.turnState?.currentPlayerIndex).toBe(0);
    expect(state.turnState?.currentPlayerId).toBe('p1');
  });

  it('should set turnState to undefined if the last player is removed', () => {
    const lastPlayerState: BaseGameState = {
      ...BASE_INITIAL_STATE,
      players: { p1: { id: 'p1' } as any },
      turnState: {
        playerOrder: ['p1'],
        currentPlayerIndex: 0,
        currentPlayerId: 'p1',
        direction: 'forward',
        roundNumber: 1,
        turnNumber: 1,
        skipsRemaining: 0,
      },
    };

    const action = { type: 'REMOVE_PLAYER' as const, payload: { playerId: 'p1' } };
    const state = gameReducer(lastPlayerState, action);

    expect(state.turnState).toBeUndefined();
  });
});
