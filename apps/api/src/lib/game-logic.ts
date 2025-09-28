/*
 * Represents the generic state of any game.
 * The game logic module will define the specific structure.
 */
export type GameState = any;

/*
 * Represents a generic player.
 */
export interface Player {
  id: string;
  name: string;
  // Other generic player properties can go here
}

/*
 * Defines the contract for all game logic modules.
 */
export interface IGameLogic {
  /**
   * Returns the initial state for a new game.
   * @param roomConfig The basic configuration of the room.
   */
  getInitialState: (roomConfig: any) => GameState;

  /**
   * Handles a player joining the game.
   * @param state The current game state.
   * @param playerName The name of the player joining.
   * @returns An object indicating the result of the join attempt.
   */
  onPlayerJoin: (state: GameState, playerName: string) => { success: boolean; newState: GameState; player?: Player; error?: string };

  /**
   * Processes a game-specific action from a client.
   * @param state The current game state.
   * @param type The type of the action (e.g., 'TOGGLE_LOGO').
   * @param payload The data associated with the action.
   * @param playerId The ID of the player who initiated the action.
   * @returns The new game state.
   */
  handleAction: (state: GameState, type: string, payload: any, playerId: string) => GameState;
}
