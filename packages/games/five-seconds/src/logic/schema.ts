// packages/games/five-seconds/game-logic/schema.ts
import { BaseGameStateSchema, GameActionSchema, PlayerSchema } from '@guess-logo/game-core';
import { z } from 'zod';
import { difficultySchema, questionSchema } from '../schema';

export const FiveSecondsGameSettingsSchema = z.object({
  categoryIds: z.array(z.string()),
  difficulty: difficultySchema,
  timePerTurn: z.number(),
  roundsToWin: z.number(),
});

export const VotingStateSchema = z.object({
  isVoting: z.boolean(),
  votes: z.array(z.object({ playerId: z.string(), isValid: z.boolean() })),
  voters: z.array(z.string()),
  currentVoterIndex: z.number(),
});

export const FiveSecondsGameStateSchema = BaseGameStateSchema.extend({
  settings: FiveSecondsGameSettingsSchema,
  players: z.record(z.string(), PlayerSchema),
  votingState: VotingStateSchema.nullable(),
  seenQuestionIds: z.array(z.string()),
  currentQuestion: questionSchema.nullable(),
  questions: z.array(questionSchema),
});

// Action Schemas
export const AddSeenQuestionIdActionSchema = z.object({
  type: z.literal('ADD_SEEN_QUESTION_ID'),
  payload: z.object({ id: z.string() }),
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

// Action dispatched by frontend to trigger question fetching
export const FetchQuestionActionSchema = z.object({
  type: z.literal('FETCH_QUESTION'),
});

export const SetQuestionActionSchema = z.object({
  type: z.literal('SET_QUESTION'),
  payload: z.object({ question: questionSchema }),
});

// Internal action dispatched by effect handler after fetching questions
export const LoadQuestionsActionSchema = z.object({
  type: z.literal('LOAD_QUESTIONS'),
  payload: z.object({
    questions: z.array(questionSchema),
  }),
});

// Internal error action dispatched by effect handler on fetch failure
export const FetchQuestionsErrorActionSchema = z.object({
  type: z.literal('FETCH_QUESTIONS_ERROR'),
  payload: z.object({
    error: z.string(),
  }),
});

export const FiveSecondsCustomActionSchema = z.discriminatedUnion('type', [
  AddSeenQuestionIdActionSchema,
  StartVotingActionSchema,
  SubmitVoteActionSchema,
  TallyVotesActionSchema,
  ResetVotingActionSchema,
  FetchQuestionActionSchema,
  SetQuestionActionSchema,
  LoadQuestionsActionSchema,
  FetchQuestionsErrorActionSchema,
]);

// Export the full union for use in the reducer
export const FiveSecondsActionSchema = z.discriminatedUnion('type', [
  ...GameActionSchema.options,
  ...FiveSecondsCustomActionSchema.options,
]);

// Type exports
export type FiveSecondsAction = z.infer<typeof FiveSecondsActionSchema>;
export type AddSeenQuestionIdAction = z.infer<typeof AddSeenQuestionIdActionSchema>;
export type StartVotingAction = z.infer<typeof StartVotingActionSchema>;
export type SubmitVoteAction = z.infer<typeof SubmitVoteActionSchema>;
export type TallyVotesAction = z.infer<typeof TallyVotesActionSchema>;
export type SetQuestionAction = z.infer<typeof SetQuestionActionSchema>;
export type LoadQuestionsAction = z.infer<typeof LoadQuestionsActionSchema>;
export type FetchQuestionsErrorAction = z.infer<typeof FetchQuestionsErrorActionSchema>;
export type FiveSecondsGameState = z.infer<typeof FiveSecondsGameStateSchema>;
export type FiveSecondsGameSettings = z.infer<typeof FiveSecondsGameSettingsSchema>;
export type VotingState = z.infer<typeof VotingStateSchema>;
