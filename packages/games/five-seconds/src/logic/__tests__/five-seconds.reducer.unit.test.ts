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

  describe('ephemeral State Clearing', () => {
    const stateWithEphemeralData: FiveSecondsGameState = {
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
      turnTimerEndsAt: Date.now() + 5000,
      seenQuestionIds: ['q1', 'q2', 'q3'],
      customSeenQuestionIds: [],
      currentQuestion: { id: 'q4', text: 'Test question', difficulty: 'medium', categoryId: 'cat1' },
      readingTime: 0,
      readingTimerEndsAt: null,
      questions: [
        { id: 'q5', text: 'Buffer question 1', difficulty: 'easy', categoryId: 'cat1' },
        { id: 'q6', text: 'Buffer question 2', difficulty: 'hard', categoryId: 'cat2' },
      ],
      questionError: { message: 'No questions available', canRetry: true, suggestSettingsChange: true },
      votingState: {
        isVoting: true,
        votes: [{ playerId: 'p2', isValid: true }],
        voters: ['p2'],
        currentVoterIndex: 0,
      },
    };

    it('should clear ephemeral state on START_GAME', () => {
      const state = fiveSecondsGameReducer(stateWithEphemeralData, { type: 'START_GAME' });

      expect(state.currentQuestion).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.questionError).toBeNull();
      expect(state.turnTimerEndsAt).toBeNull();
      expect(state.votingState).toBeNull();
      expect(state.seenQuestionIds).toEqual(['q1', 'q2', 'q3']);
      expect(state.phase).toBe('playing');
    });

    it('should clear ephemeral state on END_GAME', () => {
      const state = fiveSecondsGameReducer(stateWithEphemeralData, { type: 'END_GAME' });

      expect(state.currentQuestion).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.questionError).toBeNull();
      expect(state.turnTimerEndsAt).toBeNull();
      expect(state.votingState).toBeNull();
      expect(state.seenQuestionIds).toEqual(['q1', 'q2', 'q3']);
    });

    it('should clear ephemeral state on SET_PHASE to lobby', () => {
      const state = fiveSecondsGameReducer(stateWithEphemeralData, {
        type: 'SET_PHASE',
        payload: 'lobby',
      });

      expect(state.phase).toBe('lobby');
      expect(state.currentQuestion).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.questionError).toBeNull();
      expect(state.turnTimerEndsAt).toBeNull();
      expect(state.votingState).toBeNull();
      expect(state.seenQuestionIds).toEqual(['q1', 'q2', 'q3']);
    });

    it('should clear ephemeral state on SET_PHASE to results', () => {
      const state = fiveSecondsGameReducer(stateWithEphemeralData, {
        type: 'SET_PHASE',
        payload: 'results',
      });

      expect(state.phase).toBe('results');
      expect(state.currentQuestion).toBeNull();
      expect(state.questions).toEqual([]);
      expect(state.questionError).toBeNull();
      expect(state.turnTimerEndsAt).toBeNull();
      expect(state.votingState).toBeNull();
      expect(state.seenQuestionIds).toEqual(['q1', 'q2', 'q3']);
    });

    it('should clear questionError on UPDATE_SETTINGS', () => {
      const state = fiveSecondsGameReducer(stateWithEphemeralData, {
        type: 'UPDATE_SETTINGS',
        payload: { difficulty: 'hard' },
      });

      expect(state.questionError).toBeNull();
      expect(state.settings.difficulty).toBe('hard');
    });
  });

  describe('customSeenQuestionIds tracking', () => {
    it('should track seen IDs in customSeenQuestionIds when useCustomQuestions is enabled', () => {
      const customState: FiveSecondsGameState = {
        ...initialState,
        settings: { ...initialState.settings, useCustomQuestions: true },
      };

      const state = fiveSecondsGameReducer(customState, {
        type: 'ADD_SEEN_QUESTION_ID',
        payload: { id: 'custom-q-1' },
      });

      expect(state.customSeenQuestionIds).toContain('custom-q-1');
      expect(state.seenQuestionIds).toHaveLength(0);
    });

    it('should track seen IDs in seenQuestionIds when useCustomQuestions is disabled', () => {
      const state = fiveSecondsGameReducer(initialState, {
        type: 'ADD_SEEN_QUESTION_ID',
        payload: { id: 'server-q-1' },
      });

      expect(state.seenQuestionIds).toContain('server-q-1');
      expect(state.customSeenQuestionIds).toHaveLength(0);
    });

    it('should push custom question IDs to customSeenQuestionIds on SET_QUESTION', () => {
      const customState: FiveSecondsGameState = {
        ...initialState,
        settings: { ...initialState.settings, useCustomQuestions: true },
      };

      const state = fiveSecondsGameReducer(customState, {
        type: 'SET_QUESTION',
        payload: { question: { id: 'cq1', text: 'Custom Q?', difficulty: 'easy', categoryId: 'my-cat' } as any },
      });

      expect(state.customSeenQuestionIds).toContain('cq1');
      expect(state.seenQuestionIds).toHaveLength(0);
    });

    it('should clear customSeenQuestionIds on START_GAME', () => {
      const stateWithCustomSeen: FiveSecondsGameState = {
        ...initialState,
        customSeenQuestionIds: ['cq1', 'cq2'],
      };

      const state = fiveSecondsGameReducer(stateWithCustomSeen, { type: 'START_GAME' });

      expect(state.customSeenQuestionIds).toHaveLength(0);
    });

    it('should cap customSeenQuestionIds at 200 items', () => {
      const customState: FiveSecondsGameState = {
        ...initialState,
        settings: { ...initialState.settings, useCustomQuestions: true },
        customSeenQuestionIds: Array.from({ length: 200 }, (_, i) => `cq${i}`),
      };

      const state = fiveSecondsGameReducer(customState, {
        type: 'ADD_SEEN_QUESTION_ID',
        payload: { id: 'cq200' },
      });

      expect(state.customSeenQuestionIds).toHaveLength(200);
      expect(state.customSeenQuestionIds).not.toContain('cq0');
      expect(state.customSeenQuestionIds).toContain('cq200');
    });
  });

  describe('seenQuestionIds LRU Cap', () => {
    it('should cap seenQuestionIds at 400 items', () => {
      const stateWith400Questions: FiveSecondsGameState = {
        ...initialState,
        seenQuestionIds: Array.from({ length: 400 }, (_, i) => `q${i}`),
      };

      const state = fiveSecondsGameReducer(stateWith400Questions, {
        type: 'ADD_SEEN_QUESTION_ID',
        payload: { id: 'q401' },
      });

      expect(state.seenQuestionIds).toHaveLength(400);
      expect(state.seenQuestionIds).not.toContain('q0');
      expect(state.seenQuestionIds).toContain('q401');
      expect(state.seenQuestionIds).toContain('q1');
    });

    it('should keep newest questions when cap is reached', () => {
      const stateWith401Questions: FiveSecondsGameState = {
        ...initialState,
        seenQuestionIds: Array.from({ length: 401 }, (_, i) => `q${i}`),
      };

      const state = fiveSecondsGameReducer(stateWith401Questions, {
        type: 'ADD_SEEN_QUESTION_ID',
        payload: { id: 'q402' },
      });

      expect(state.seenQuestionIds).toHaveLength(400);
      expect(state.seenQuestionIds[0]).toBe('q2');
      expect(state.seenQuestionIds[399]).toBe('q402');
      expect(state.seenQuestionIds).not.toContain('q0');
      expect(state.seenQuestionIds).not.toContain('q1');
    });

    it('should cap when setting question directly', () => {
      const stateWith400Questions: FiveSecondsGameState = {
        ...initialState,
        seenQuestionIds: Array.from({ length: 400 }, (_, i) => `q${i}`),
        currentQuestion: null,
      };

      const state = fiveSecondsGameReducer(stateWith400Questions, {
        type: 'SET_QUESTION',
        payload: { question: { id: 'q401', text: 'New question', difficulty: 'medium', categoryId: 'cat1' } as any },
      });

      expect(state.seenQuestionIds).toHaveLength(400);
      expect(state.seenQuestionIds).not.toContain('q0');
      expect(state.seenQuestionIds).toContain('q401');
    });
  });
});
