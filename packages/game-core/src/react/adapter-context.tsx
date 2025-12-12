import type { GameAdapter } from '../adapters/types';
import type { GameAction } from '../game-logic/schema/actions.types';
import type { BaseGameState } from '../game-logic/schema/state.types';
import { createContext, useContext } from 'react';

const AdapterContext = createContext<GameAdapter<
  BaseGameState,
  any
> | null>(null);

export interface AdapterProviderProps<
  TAction extends GameAction = GameAction,
> {
  adapter: GameAdapter<BaseGameState, TAction>;
  children: React.ReactNode;
}

/**
 * Provider component that makes the game adapter available to all child components.
 *
 * @example
 * ```tsx
 * const adapter = createLocalAdapter(initialState);
 *
 * <AdapterProvider adapter={adapter}>
 *   <GameBoard />
 * </AdapterProvider>
 * ```
 */
export function AdapterProvider<TAction extends GameAction = GameAction>({
  adapter,
  children,
}: AdapterProviderProps<TAction>) {
  return (
    <AdapterContext.Provider value={adapter}>
      {children}
    </AdapterContext.Provider>
  );
}

/**
 * Hook to access the game adapter from context.
 * Throws an error if used outside of AdapterProvider.
 *
 * @internal
 */
export function useAdapter<
  TAction extends GameAction = GameAction,
>(): GameAdapter<BaseGameState, TAction> {
  const adapter = useContext(AdapterContext);

  if (!adapter) {
    throw new Error(
      'useAdapter must be used within an AdapterProvider. '
      + 'Wrap your component tree with <AdapterProvider adapter={...}>',
    );
  }

  return adapter;
}
