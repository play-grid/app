import type { GameAction } from '../game-logic/schema/actions.types';
import type { BaseGameState } from '../game-logic/schema/state.types';

/**
 * Unsubscribe function returned by subscribe method
 */
export type Unsubscribe = () => void;

/**
 * Listener function that receives state updates
 */
export type StateListener<TState = BaseGameState> = (state: TState) => void;

/**
 * The core adapter interface that abstracts state management.
 *
 * This interface works with ANY implementation:
 * - Local Zustand store (client-authoritative)
 * - Multiplayer WebSocket adapter (server-authoritative)
 * - Custom adapters (e.g., P2P, Redux, etc.)
 *
 * React components only depend on this interface, not the implementation.
 */
export interface GameAdapter<
  TState = BaseGameState,
  TAction = GameAction,
> {
  /**
   * Get the current state snapshot.
   * This is called synchronously by React during render.
   */
  getState: () => TState;

  /**
   * Dispatch an action to update the state.
   *
   * **Always async** to support both local and multiplayer modes:
   * - Local: Resolves immediately after state update
   * - Multiplayer: Resolves after server acknowledgment
   *
   * @param action - The action to dispatch
   * @returns Promise that resolves when action is processed
   */
  dispatch: (action: TAction) => Promise<void>;

  /**
   * Subscribe to state changes.
   *
   * React's`useSyncExternalStore` will call this to listen for updates (React 18 feature).
   * The listener should be called whenever state changes.
   *
   * @param listener - Function to call when state changes
   * @returns Unsubscribe function to stop listening
   */
  subscribe: (listener: StateListener<TState>) => Unsubscribe;
}
