import type { FiveSecondsGameState } from '../schema';
import { beforeEach, describe, expect, it } from 'vitest';
import { FIVE_SECONDS_CUSTOM_STATE, FIVE_SECONDS_INITIAL_SETTINGS } from '../initial-state';
import { fiveSecondsGameReducer } from '../reducer';

describe('five Seconds Game Reducer', () => {
  let initialState: FiveSecondsGameState;

  beforeEach(() => {
    initialState = {
      phase: 'playing',
      hostId: 'p1',
      createdAt: Date.now(),
      settings: FIVE_SECONDS_INITIAL_SETTINGS,
      players: {
        p1: { id: 'p1', name: 'Mohammed', isHost: true, isReady: true, score: 0 },
        p2: { id: 'p2', name: 'Abdullah', isHost: false, isReady: true, score: 0 },
      },
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
      turnTimerEndsAt: null,
      ...FIVE_SECONDS_CUSTOM_STATE,
      questions: [],
      currentQuestion: null,
    };
  });

  describe('question Management', () => {
    const mockQuestion = { id: 'q1', text: 'Name 3 Fruits', difficulty: 'easy', categoryId: 'cat1' };

    it('should load a batch of questions and set the first one as current if empty', () => {
      const state = fiveSecondsGameReducer(initialState, {
        type: 'LOAD_QUESTIONS',
        payload: { questions: [mockQuestion as any] },
      });

      expect(state.questions).toHaveLength(1);
      expect(state.currentQuestion?.id).toBe('q1');
      expect(state.seenQuestionIds).toContain('q1');
    });

    it('should set a specific question and add it to seen IDs', () => {
      const state = fiveSecondsGameReducer(initialState, {
        type: 'SET_QUESTION',
        payload: { question: mockQuestion as any },
      });

      expect(state.currentQuestion?.id).toBe('q1');
      expect(state.seenQuestionIds).toContain('q1');
    });
  });

  describe('voting Logic', () => {
    it('should initialize voting state and change turn phase', () => {
      const state = fiveSecondsGameReducer(initialState, {
        type: 'START_VOTING',
        payload: { voters: ['p2'] },
      });

      expect(state.turnState?.phase).toBe('voting');
      expect(state.votingState).toBeDefined();
      expect(state.votingState?.voters).toEqual(['p2']);
      expect(state.votingState?.isVoting).toBe(true);
    });

    it('should record votes and increment the voter index', () => {
      let state = fiveSecondsGameReducer(initialState, {
        type: 'START_VOTING',
        payload: { voters: ['p1', 'p2'] },
      });

      state = fiveSecondsGameReducer(state, {
        type: 'SUBMIT_VOTE',
        payload: { isValid: true },
      });

      expect(state.votingState?.votes).toHaveLength(1);
      expect(state.votingState?.votes[0]).toEqual({ playerId: 'p1', isValid: true });
      expect(state.votingState?.currentVoterIndex).toBe(1);
    });
  });

  describe('scoring and Transitions', () => {
    it('should increment player score on TALLY_VOTES if majority voted valid', () => {
      const votingState: FiveSecondsGameState = {
        ...initialState,
        votingState: {
          isVoting: true,
          voters: ['p2'],
          votes: [{ playerId: 'p2', isValid: true }],
          currentVoterIndex: 1,
        },
      };

      const state = fiveSecondsGameReducer(votingState, {
        type: 'TALLY_VOTES',
        payload: { currentPlayerId: 'p1' },
      });

      expect(state.players.p1.score).toBe(1);
      expect(state.votingState).toBeNull();
    });

    it('should transition turn correctly and clear current question', () => {
      const state = fiveSecondsGameReducer(initialState, { type: 'NEXT_TURN' });

      expect(state.turnState?.currentPlayerId).toBe('p2');
      expect(state.turnState?.phase).toBe('pre-turn');
      expect(state.currentQuestion).toBeNull();
      expect(state.turnState?.turnNumber).toBe(1);
    });
  });
});
