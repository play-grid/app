import type { Player } from '@guess-logo/game-core/types';
import { GameActionSchema } from '@guess-logo/game-core/game-logic/schema/actions';
import { BaseGameStateSchema, PlayerSchema } from '@guess-logo/game-core/game-logic/schema/state';

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
  players: z.record(z.string(), PlayerSchema as z.ZodType<Player>),

  votingState: VotingStateSchema.nullable(),
  seenQuestionIds: z.array(z.string()),
});

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
