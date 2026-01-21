import {
  BaseGameStateSchema,
  GameActionSchema,
  PlayerSchema,
} from '@guess-logo/game-core';
import { z } from 'zod';
import { baseQuestionSchema, difficultySchema } from '../schema';

// GAME STATE
export const FiveSecondsGameSettingsSchema = z.object({
  categoryIds: z.array(z.string()),
  difficulty: difficultySchema,
  timePerTurn: z.number(),
  pointsToWin: z.number(),
  useCustomQuestions: z.boolean().default(false),
  customCategoryIds: z.array(z.string()).optional(),
});

export const VotingStateSchema = z.object({
  isVoting: z.boolean(),
  votes: z.array(z.object({ playerId: z.string(), isValid: z.boolean() })),
  voters: z.array(z.string()),
  currentVoterIndex: z.number(),
});

export const QuestionErrorSchema = z.object({
  message: z.string(),
  canRetry: z.boolean().default(true),
  suggestSettingsChange: z.boolean().default(false),
});

export type QuestionError = z.infer<typeof QuestionErrorSchema>;

export const FiveSecondsGameStateSchema = BaseGameStateSchema.extend({
  settings: FiveSecondsGameSettingsSchema,
  players: z.record(z.string(), PlayerSchema),
  votingState: VotingStateSchema.nullable(),
  seenQuestionIds: z.array(z.string()),
  currentQuestion: baseQuestionSchema.nullable(),
  questions: z.array(baseQuestionSchema).default([]),
  turnTimerEndsAt: z.number().nullable().default(null),
  questionError: QuestionErrorSchema.nullable().default(null),
});

// GAME ACTIONS
export const SetGameTurnPhaseActionSchema = z.object({
  type: z.literal('SET_GAME_TURN_PHASE'),
  payload: z.object({
    phase: z.string(),
  }),
});

export const AddSeenQuestionIdActionSchema = z.object({
  type: z.literal('ADD_SEEN_QUESTION_ID'),
  payload: z.object({ id: z.string() }),
});
export const StartTurnActionSchema = z.object({
  type: z.literal('START_TURN'),
});

export const StartVotingActionSchema = z.object({
  type: z.literal('START_VOTING'),
  payload: z.object({
    voters: z.array(z.string()),
  }),
});

export const SubmitVoteActionSchema = z.object({
  type: z.literal('SUBMIT_VOTE'),
  payload: z.object({ isValid: z.boolean() }),
});

export const TallyVotesActionSchema = z.object({
  type: z.literal('TALLY_VOTES'),
  payload: z.object({ currentPlayerId: z.string() }),
});

export const ResetVotingActionSchema = z.object({
  type: z.literal('RESET_VOTING'),
});

export const StartTurnTimerActionSchema = z.object({
  type: z.literal('START_TURN_TIMER'),
  payload: z.object({
    endsAt: z.number().nullable(),
  }),
});

export const TimesUpActionSchema = z.object({
  type: z.literal('TIMES_UP'),
});

// EFFECT ACTIONS (Server → Client or Client → Server)
export const FetchQuestionActionSchema = z.object({
  type: z.literal('FETCH_QUESTION'),
});

// For setting the CURRENT question (single, on-demand)
export const SetQuestionActionSchema = z.object({
  type: z.literal('SET_QUESTION'),
  payload: z.object({
    question: baseQuestionSchema,
  }),
});

// For loading a BATCH into the buffer (multiplayer only)
export const LoadQuestionsActionSchema = z.object({
  type: z.literal('LOAD_QUESTIONS'),
  payload: z.object({
    questions: z.array(baseQuestionSchema),
  }),
});

export const FetchQuestionsErrorActionSchema = z.object({
  type: z.literal('FETCH_QUESTIONS_ERROR'),
  payload: QuestionErrorSchema,
});

export const ClearQuestionErrorActionSchema = z.object({
  type: z.literal('CLEAR_QUESTION_ERROR'),
});

// UNION SCHEMAS
export const FiveSecondsCustomActionSchema = z.discriminatedUnion('type', [
  SetGameTurnPhaseActionSchema,
  AddSeenQuestionIdActionSchema,
  StartVotingActionSchema,
  SubmitVoteActionSchema,
  TallyVotesActionSchema,
  ResetVotingActionSchema,
  FetchQuestionActionSchema,
  SetQuestionActionSchema,
  LoadQuestionsActionSchema,
  FetchQuestionsErrorActionSchema,
  ClearQuestionErrorActionSchema,
  StartTurnActionSchema,
  StartTurnTimerActionSchema,
  TimesUpActionSchema,
]);

export const FiveSecondsActionSchema = z.discriminatedUnion('type', [
  ...GameActionSchema.options,
  ...FiveSecondsCustomActionSchema.options,
]);

// TYPE EXPORTS
export type FiveSecondsGameState = z.infer<typeof FiveSecondsGameStateSchema>;
export type FiveSecondsGameSettings = z.infer<
  typeof FiveSecondsGameSettingsSchema
>;
export type VotingState = z.infer<typeof VotingStateSchema>;

export type FiveSecondsAction = z.infer<typeof FiveSecondsActionSchema>;

export type AddSeenQuestionIdAction = z.infer<
  typeof AddSeenQuestionIdActionSchema
>;
export type StartVotingAction = z.infer<typeof StartVotingActionSchema>;
export type StartTurnAction = z.infer<typeof StartTurnActionSchema>;
export type SetGameTurnPhaseAction = z.infer<typeof SetGameTurnPhaseActionSchema>;
export type SubmitVoteAction = z.infer<typeof SubmitVoteActionSchema>;
export type TallyVotesAction = z.infer<typeof TallyVotesActionSchema>;
export type SetQuestionAction = z.infer<typeof SetQuestionActionSchema>;
export type LoadQuestionsAction = z.infer<typeof LoadQuestionsActionSchema>;
export type FetchQuestionsErrorAction = z.infer<
  typeof FetchQuestionsErrorActionSchema
>;
export type StartTurnTimerAction = z.infer<typeof StartTurnTimerActionSchema>;
export type TimesUpAction = z.infer<typeof TimesUpActionSchema>;
