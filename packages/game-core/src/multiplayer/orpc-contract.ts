import type { GameEventType } from '../game-logic/schema/actions';
import type { BaseGameStateWire } from '../game-logic/schema/state';
import { oc } from '@orpc/contract';
import { z } from 'zod';
import { GameEventSchema } from '../game-logic/schema/actions';
import { BaseGameStateSchema, GamePhaseSchema, PlayerSchema } from '../game-logic/schema/state';

export { PlayerSchema } from '../game-logic/schema/state';

// ============ Input Schemas ============

export const SetPhaseInputSchema = z.object({
  phase: GamePhaseSchema,
});

export const AddPlayerInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const RemovePlayerInputSchema = z.object({
  playerId: z.string(),
});

export const UpdatePlayerInputSchema = z.object({
  playerId: z.string(),
  updates: PlayerSchema.partial(),
});

export const SetPlayersInputSchema = z.object({
  players: z.record(z.string(), PlayerSchema),
});

export const TogglePlayerReadyInputSchema = z.object({
  playerId: z.string(),
});

export const UpdateSettingsInputSchema = z.object({
  updates: z.record(z.string(), z.any()),
});

export const SetCurrentPlayerInputSchema = z.object({
  playerId: z.string(),
});

// ============ Output Schemas ============

export const GameStateOutputSchema = BaseGameStateSchema;

export const SuccessOutputSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const CanStartGameOutputSchema = z.boolean();

// ============ Procedure Contracts ============

// State query
export const getStateContract = oc.output(GameStateOutputSchema);

// Real-time subscription
export const onStateUpdateContract = oc.output(GameEventSchema);

// Phase Management
export const setPhaseContract = oc.input(SetPhaseInputSchema).output(GameStateOutputSchema);

// Player Management
export const addPlayerContract = oc.input(AddPlayerInputSchema).output(GameStateOutputSchema);

export const removePlayerContract = oc.input(RemovePlayerInputSchema).output(GameStateOutputSchema);

export const updatePlayerContract = oc.input(UpdatePlayerInputSchema).output(GameStateOutputSchema);

export const setPlayersContract = oc.input(SetPlayersInputSchema).output(GameStateOutputSchema);

export const togglePlayerReadyContract = oc.input(TogglePlayerReadyInputSchema).output(GameStateOutputSchema);

// Settings
export const updateSettingsContract = oc.input(UpdateSettingsInputSchema).output(GameStateOutputSchema);

// Turn Management
export const nextTurnContract = oc.output(GameStateOutputSchema);

export const previousTurnContract = oc.output(GameStateOutputSchema);

export const setCurrentPlayerContract = oc.input(SetCurrentPlayerInputSchema).output(GameStateOutputSchema);

export const nextRoundContract = oc.output(GameStateOutputSchema);

// Lifecycle
export const canStartGameContract = oc.output(CanStartGameOutputSchema);

export const startGameContract = oc.output(GameStateOutputSchema);

export const endGameContract = oc.output(GameStateOutputSchema);

export const resetGameContract = oc.output(GameStateOutputSchema);

// ============ Contract Router ============

export const gameContract = {
  // State query
  getState: getStateContract,

  // Real-time subscription
  onStateUpdate: onStateUpdateContract,

  // Phase management
  setPhase: setPhaseContract,

  player: {
    add: addPlayerContract,
    remove: removePlayerContract,
    update: updatePlayerContract,
    setAll: setPlayersContract,
    toggleReady: togglePlayerReadyContract,
  },

  settings: {
    update: updateSettingsContract,
  },

  turn: {
    next: nextTurnContract,
    previous: previousTurnContract,
    setCurrent: setCurrentPlayerContract,
    nextRound: nextRoundContract,
  },

  lifecycle: {
    canStart: canStartGameContract,
    start: startGameContract,
    end: endGameContract,
    reset: resetGameContract,
  },
};

// ============ Type Utilities ============

export interface GameContractInputs {
  getState: void;
  onStateUpdate: void;
  setPhase: z.infer<typeof SetPhaseInputSchema>;
  player: {
    add: z.infer<typeof AddPlayerInputSchema>;
    remove: z.infer<typeof RemovePlayerInputSchema>;
    update: z.infer<typeof UpdatePlayerInputSchema>;
    setAll: z.infer<typeof SetPlayersInputSchema>;
    toggleReady: z.infer<typeof TogglePlayerReadyInputSchema>;
  };
  settings: {
    update: z.infer<typeof UpdateSettingsInputSchema>;
  };
  turn: {
    next: void;
    previous: void;
    setCurrent: z.infer<typeof SetCurrentPlayerInputSchema>;
    nextRound: void;
  };
  lifecycle: {
    canStart: void;
    start: void;
    end: void;
    reset: void;
  };
}

export interface GameContractOutputs {
  getState: BaseGameStateWire;
  onStateUpdate: GameEventType;
  setPhase: BaseGameStateWire;
  player: {
    add: BaseGameStateWire;
    remove: BaseGameStateWire;
    update: BaseGameStateWire;
    setAll: BaseGameStateWire;
    toggleReady: BaseGameStateWire;
  };
  settings: {
    update: BaseGameStateWire;
  };
  turn: {
    next: BaseGameStateWire;
    previous: BaseGameStateWire;
    setCurrent: BaseGameStateWire;
    nextRound: BaseGameStateWire;
  };
  lifecycle: {
    canStart: boolean;
    start: BaseGameStateWire;
    end: BaseGameStateWire;
    reset: BaseGameStateWire;
  };
}
