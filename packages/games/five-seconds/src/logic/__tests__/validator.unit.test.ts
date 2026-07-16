import type { FiveSecondsGameState } from '../schema';
import { describe, expect, it } from 'vitest';
import { validateFiveSecondsAction } from '../validator';

describe('validateFiveSecondsAction', () => {
  const mockState = (overrides: Partial<FiveSecondsGameState> = {}): FiveSecondsGameState => ({
    phase: 'playing',
    players: {
      p1: { id: 'p1', name: 'Player 1', score: 0, isHost: true, isReady: true },
      p2: { id: 'p2', name: 'Player 2', score: 0, isHost: false, isReady: true },
    },
    hostId: 'p1',
    settings: {
      categoryIds: ['cat_general_v1'],
      difficulty: 'easy',
      timePerTurn: 5,
      pointsToWin: 10,
      useCustomQuestions: false,
      customCategoryIds: [],
    },
    votingState: null,
    seenQuestionIds: [],
    currentQuestion: null,
    questions: [],
    turnTimerEndsAt: null,
    turnState: {
      playerOrder: ['p1', 'p2'],
      currentPlayerIndex: 0,
      currentPlayerId: 'p1',
      direction: 'forward',
      roundNumber: 1,
      turnNumber: 0,
      phase: 'pre-turn',
      skipsRemaining: 0,
    },
    customSeenQuestionIds: [],
    questionError: null,
    readingTime: 0,
    readingTimerEndsAt: null,
    createdAt: Date.now(),
    startedAt: Date.now(),
    ...overrides,
  });

  describe('start turn validation', () => {
    it('should allow current player to start their turn in pre-turn phase', () => {
      const state = mockState();
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'START_TURN' },
        playerId: 'p1',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject non-current player from starting turn', () => {
      const state = mockState();
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'START_TURN' },
        playerId: 'p2',
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Only the current player can start their turn');
    });

    it('should reject START_TURN in wrong phase', () => {
      const state = mockState({
        turnState: {
          ...mockState().turnState!,
          phase: 'answering',
        },
      });
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'START_TURN' },
        playerId: 'p1',
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('START_TURN only allowed in pre-turn phase');
    });
  });

  describe('start validation', () => {
    it('should allow START_VOTING in answering phase', () => {
      const state = mockState({
        turnState: {
          ...mockState().turnState!,
          phase: 'answering',
        },
      });
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'START_VOTING', payload: { voters: ['p2'] } },
        playerId: 'p1',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject START_VOTING in wrong phase', () => {
      const state = mockState();
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'START_VOTING', payload: { voters: ['p2'] } },
        playerId: 'p1',
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('START_VOTING only allowed in answering phase');
    });
  });

  describe('submit vote validation', () => {
    it('should allow current voter to submit vote', () => {
      const state = mockState({
        turnState: {
          ...mockState().turnState!,
          phase: 'voting',
        },
        votingState: {
          isVoting: true,
          votes: [],
          voters: ['p2'],
          currentVoterIndex: 0,
        },
      });
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'SUBMIT_VOTE', payload: { isValid: true } },
        playerId: 'p2',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject non-current voter from submitting vote', () => {
      const state = mockState({
        turnState: {
          ...mockState().turnState!,
          phase: 'voting',
        },
        votingState: {
          isVoting: true,
          votes: [],
          voters: ['p2'],
          currentVoterIndex: 0,
        },
      });
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'SUBMIT_VOTE', payload: { isValid: true } },
        playerId: 'p1', // Wrong voter
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Not your turn to vote');
    });

    it('should reject SUBMIT_VOTE in wrong phase', () => {
      const state = mockState();
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'SUBMIT_VOTE', payload: { isValid: true } },
        playerId: 'p2',
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('SUBMIT_VOTE only allowed in voting phase');
    });
  });

  describe('tally votes validation', () => {
    it('should allow tallying when voting is complete', () => {
      const state = mockState({
        votingState: {
          isVoting: true,
          votes: [{ playerId: 'p2', isValid: true }],
          voters: ['p2'],
          currentVoterIndex: 1, // Voting complete
        },
      });
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'TALLY_VOTES', payload: { currentPlayerId: 'p1' } },
        playerId: 'p1',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject tallying when voting is not complete', () => {
      const state = mockState({
        votingState: {
          isVoting: true,
          votes: [],
          voters: ['p2'],
          currentVoterIndex: 0, // Voting not complete
        },
      });
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'TALLY_VOTES', payload: { currentPlayerId: 'p1' } },
        playerId: 'p1',
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('Cannot tally votes, voting not complete');
    });
  });

  describe('next turn validation', () => {
    it('should allow NEXT_TURN in pre-turn phase', () => {
      const state = mockState({
        turnState: {
          ...mockState().turnState!,
          phase: 'pre-turn',
        },
      });
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'NEXT_TURN' },
        playerId: 'p1',
      });
      expect(result.valid).toBe(true);
    });

    it('should reject NEXT_TURN outside pre-turn phase', () => {
      const state = mockState({
        turnState: {
          ...mockState().turnState!,
          phase: 'voting',
        },
        votingState: {
          isVoting: true,
          votes: [],
          voters: ['p2'],
          currentVoterIndex: 0,
        },
      });
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'NEXT_TURN' },
        playerId: 'p1',
      });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('NEXT_TURN is handled automatically by TALLY_VOTES. Only allowed in pre-turn phase for special cases.');
    });
  });

  describe('core actions', () => {
    const coreActions = [
      'ADD_PLAYER',
      'REMOVE_PLAYER',
      'UPDATE_SETTINGS',
      'START_GAME',
      'END_GAME',
      'RESET_GAME',
      'SET_PHASE',
    ];

    coreActions.forEach((actionType) => {
      it(`should allow ${actionType} (core action)`, () => {
        const state = mockState();
        const result = validateFiveSecondsAction({
          state,
          action: { type: actionType },
          playerId: 'p1',
        });
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('effect actions', () => {
    const effectActions = [
      'TIMES_UP',
      'LOAD_QUESTIONS',
      'SET_QUESTION',
      'START_TURN_TIMER',
    ];

    effectActions.forEach((actionType) => {
      it(`should allow ${actionType} (effect action)`, () => {
        const state = mockState();
        const result = validateFiveSecondsAction({
          state,
          action: { type: actionType },
          playerId: 'p1',
        });
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('custom questions feature gate', () => {
    it('should allow UPDATE_SETTINGS with useCustomQuestions=true when feature flag is enabled', () => {
      const state = mockState();
      const result = validateFiveSecondsAction({
        state,
        action: {
          type: 'UPDATE_SETTINGS',
          payload: { useCustomQuestions: true },
        },
        playerId: 'p1',
      });
      expect(result.valid).toBe(true);
    });

    it('should allow UPDATE_SETTINGS with useCustomQuestions=false when feature flag is enabled', () => {
      const state = mockState();
      const result = validateFiveSecondsAction({
        state,
        action: {
          type: 'UPDATE_SETTINGS',
          payload: { useCustomQuestions: false },
        },
        playerId: 'p1',
      });
      expect(result.valid).toBe(true);
    });
  });

  describe('unknown actions', () => {
    it('should allow unknown actions', () => {
      const state = mockState();
      const result = validateFiveSecondsAction({
        state,
        action: { type: 'UNKNOWN_ACTION' },
        playerId: 'p1',
      });
      expect(result.valid).toBe(true);
    });
  });
});
