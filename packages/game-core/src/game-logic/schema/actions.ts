import z from 'zod';

import {
  BaseGameStateSchema,
  GamePhaseSchema,
  PlayerSchema,
  TurnStateSchema,
} from './state';

export const GameEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('state_update'),
    state: BaseGameStateSchema,
    timestamp: z.number(),
  }),

  z.object({
    type: z.literal('player_joined'),
    player: PlayerSchema,
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('player_left'),
    playerId: z.string(),
    timestamp: z.number(),
  }),

  z.object({
    type: z.literal('phase_changed'),
    phase: GamePhaseSchema,
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal('turn_changed'),
    turnState: TurnStateSchema,
    timestamp: z.number(),
  }),
]);

export type GameEventType = z.infer<typeof GameEventSchema>;

export const SetPhaseActionSchema = z.object({
  type: z.literal('SET_PHASE'),
  payload: GamePhaseSchema,
});

export const AddPlayerActionSchema = z.object({
  type: z.literal('ADD_PLAYER'),
  payload: PlayerSchema.omit({ isHost: true, isReady: true }),
});

export const RemovePlayerActionSchema = z.object({
  type: z.literal('REMOVE_PLAYER'),
  payload: z.object({ playerId: z.string() }),
});

export const UpdatePlayerActionSchema = z.object({
  type: z.literal('UPDATE_PLAYER'),
  payload: z.object({
    playerId: z.string(),
    updates: PlayerSchema.partial(),
  }),
});

export const SetPlayersActionSchema = z.object({
  type: z.literal('SET_PLAYERS'),
  payload: z.record(z.string(), PlayerSchema),
});

export const TogglePlayerReadyActionSchema = z.object({
  type: z.literal('TOGGLE_PLAYER_READY'),
  payload: z.object({ playerId: z.string() }),
});

export const UpdateSettingsActionSchema = z.object({
  type: z.literal('UPDATE_SETTINGS'),
      payload: z.record(z.string(), z.any()),});

export const NextTurnActionSchema = z.object({
  type: z.literal('NEXT_TURN'),
});

export const PreviousTurnActionSchema = z.object({
  type: z.literal('PREVIOUS_TURN'),
});

export const SetCurrentPlayerActionSchema = z.object({
  type: z.literal('SET_CURRENT_PLAYER'),
  payload: z.object({ playerId: z.string() }),
});

export const NextRoundActionSchema = z.object({
  type: z.literal('NEXT_ROUND'),
});

export const StartGameActionSchema = z.object({
  type: z.literal('START_GAME'),
});

export const EndGameActionSchema = z.object({
  type: z.literal('END_GAME'),
});

export const ResetGameActionSchema = z.object({
  type: z.literal('RESET_GAME'),
});

export const ActionSchema = z.union([
  SetPhaseActionSchema,
  AddPlayerActionSchema,
  RemovePlayerActionSchema,
  UpdatePlayerActionSchema,
  SetPlayersActionSchema,
  TogglePlayerReadyActionSchema,
  UpdateSettingsActionSchema,
  NextTurnActionSchema,
  PreviousTurnActionSchema,
  SetCurrentPlayerActionSchema,
  NextRoundActionSchema,
  StartGameActionSchema,
  EndGameActionSchema,
  ResetGameActionSchema,
]);

export type GameAction = z.infer<typeof ActionSchema>;
