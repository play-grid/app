import { BaseGameStateSchema, GameActionSchema, PlayerSchema } from '@guess-logo/game-core';
import { z } from 'zod';
import { difficultySchema } from '../schema';

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
});

export const AddSeenQuestionIdActionSchema = z.object({
  type: z.literal('ADD_SEEN_QUESTION_ID'),
  payload: z.object({ id: z.string() }),
});
export type AddSeenQuestionIdAction = z.infer<typeof AddSeenQuestionIdActionSchema>;

export const StartVotingActionSchema = z.object({
  type: z.literal('START_VOTING'),
  payload: z.object({
    voters: z.array(z.string()),
  }),
});
export type StartVotingAction = z.infer<typeof StartVotingActionSchema>;

export const SubmitVoteActionSchema = z.object({
  type: z.literal('SUBMIT_VOTE'),
  payload: z.object({ isValid: z.boolean() }),
});
export type SubmitVoteAction = z.infer<typeof SubmitVoteActionSchema>;

export const TallyVotesActionSchema = z.object({
  type: z.literal('TALLY_VOTES'),
});

export const ResetVotingActionSchema = z.object({
  type: z.literal('RESET_VOTING'),
});

export const FiveSecondsActionSchema = z.union([
  GameActionSchema,
  AddSeenQuestionIdActionSchema,
  StartVotingActionSchema,
  SubmitVoteActionSchema,
  TallyVotesActionSchema,
  ResetVotingActionSchema,
]);

export type FiveSecondsGameState = z.infer<typeof FiveSecondsGameStateSchema>;
export type FiveSecondsGameSettings = z.infer<typeof FiveSecondsGameSettingsSchema>;
export type VotingState = z.infer<typeof VotingStateSchema>;
export type FiveSecondsAction = z.infer<typeof FiveSecondsActionSchema>;
