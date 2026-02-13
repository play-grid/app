import z from 'zod';
import { GamePhaseSchema } from './state.types';

export const InitTurnStateActionSchema = z.object({
  type: z.literal('INIT_TURN_STATE'),
  payload: z.object({
    playerOrder: z.array(z.string()).optional(),
    startingPlayerId: z.string().optional(),
    initialPhase: GamePhaseSchema.optional(),
  }).optional(),
});

export type InitTurnStateAction = z.infer<typeof InitTurnStateActionSchema>;

export const NextTurnActionSchema = z.object({
  type: z.literal('NEXT_TURN'),
  payload: z.object({
    skipCount: z.number().int().min(0).optional(),
    resetPhase: GamePhaseSchema.optional(),
  }).optional(),
});

export type NextTurnAction = z.infer<typeof NextTurnActionSchema>;

export const PreviousTurnActionSchema = z.object({
  type: z.literal('PREVIOUS_TURN'),
});

export type PreviousTurnAction = z.infer<typeof PreviousTurnActionSchema>;

export const ReverseTurnDirectionActionSchema = z.object({
  type: z.literal('REVERSE_TURN_DIRECTION'),
});

export type ReverseTurnDirectionAction = z.infer<typeof ReverseTurnDirectionActionSchema>;

export const SkipPlayersActionSchema = z.object({
  type: z.literal('SKIP_PLAYERS'),
  payload: z.object({
    count: z.number().int().min(1).default(1),
  }),
});

export type SkipPlayersAction = z.infer<typeof SkipPlayersActionSchema>;

export const SetCurrentPlayerActionSchema = z.object({
  type: z.literal('SET_CURRENT_PLAYER'),
  payload: z.object({
    playerId: z.string(),
  }),
});

export type SetCurrentPlayerAction = z.infer<typeof SetCurrentPlayerActionSchema>;

export const SetGamePhaseSchemaAction = z.object({
  type: z.literal('SET_TURN_PHASE'),
  payload: z.object({
    phase: GamePhaseSchema,
  }),
});

export type SetTurnPhaseAction = z.infer<typeof SetGamePhaseSchemaAction>;

export const ReorderPlayersActionSchema = z.object({
  type: z.literal('REORDER_PLAYERS'),
  payload: z.object({
    newOrder: z.array(z.string()),
  }),
});

export type ReorderPlayersAction = z.infer<typeof ReorderPlayersActionSchema>;

export const NextRoundActionSchema = z.object({
  type: z.literal('NEXT_ROUND'),
  payload: z.object({
    startingPlayerId: z.string().optional(),
    resetPhase: GamePhaseSchema.optional(),
  }).optional(),
});

export type NextRoundAction = z.infer<typeof NextRoundActionSchema>;

export const SetPhaseActionSchema = z.object({
  type: z.literal('SET_PHASE'),
  payload: GamePhaseSchema,
});

export type SetPhaseAction = z.infer<typeof SetPhaseActionSchema>;

export const AddPlayerActionSchema = z.object({
  type: z.literal('ADD_PLAYER'),
  payload: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().optional(),
  }),
});

export type AddPlayerAction = z.infer<typeof AddPlayerActionSchema>;

export const RemovePlayerActionSchema = z.object({
  type: z.literal('REMOVE_PLAYER'),
  payload: z.object({ playerId: z.string() }),
});

export type RemovePlayerAction = z.infer<typeof RemovePlayerActionSchema>;

export const UpdatePlayerActionSchema = z.object({
  type: z.literal('UPDATE_PLAYER'),
  payload: z.object({
    playerId: z.string(),
    updates: z.record(z.string(), z.any()),
  }),
});

export type UpdatePlayerAction = z.infer<typeof UpdatePlayerActionSchema>;

export const TogglePlayerReadyActionSchema = z.object({
  type: z.literal('TOGGLE_PLAYER_READY'),
  payload: z.object({ playerId: z.string() }),
});

export type TogglePlayerReadyAction = z.infer<typeof TogglePlayerReadyActionSchema>;

export const UpdateSettingsActionSchema = z.object({
  type: z.literal('UPDATE_SETTINGS'),
  payload: z.record(z.string(), z.any()),
});

export type UpdateSettingsAction = z.infer<typeof UpdateSettingsActionSchema>;

export const StartGameActionSchema = z.object({
  type: z.literal('START_GAME'),
  payload: z.object({
    playerOrder: z.array(z.string()).optional(),
    startingPlayerId: z.string().optional(),
  }).optional(),
});

export type StartGameAction = z.infer<typeof StartGameActionSchema>;

export const EndGameActionSchema = z.object({
  type: z.literal('END_GAME'),
});

export type EndGameAction = z.infer<typeof EndGameActionSchema>;

export const ResetGameActionSchema = z.object({
  type: z.literal('RESET_GAME'),
});

export type ResetGameAction = z.infer<typeof ResetGameActionSchema>;

export const SubPhaseTimerStartedActionSchema = z.object({
  type: z.literal('SUB_PHASE_TIMER_STARTED'),
  payload: z.object({
    phase: z.string(),
    endsAt: z.number(),
  }),
});

export type SubPhaseTimerStartedAction = z.infer<typeof SubPhaseTimerStartedActionSchema>;

export const GameActionSchema = z.discriminatedUnion('type', [
  SetPhaseActionSchema,
  StartGameActionSchema,
  EndGameActionSchema,
  ResetGameActionSchema,
  AddPlayerActionSchema,
  RemovePlayerActionSchema,
  UpdatePlayerActionSchema,
  TogglePlayerReadyActionSchema,
  UpdateSettingsActionSchema,
  InitTurnStateActionSchema,
  NextTurnActionSchema,
  PreviousTurnActionSchema,
  ReverseTurnDirectionActionSchema,
  SkipPlayersActionSchema,
  SetCurrentPlayerActionSchema,
  SetGamePhaseSchemaAction,
  ReorderPlayersActionSchema,
  NextRoundActionSchema,
  SubPhaseTimerStartedActionSchema,
]);
export type GameAction = z.infer<typeof GameActionSchema>;
