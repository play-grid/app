import type { GameAdapter } from '../adapters/types';
import type { BaseGameStateWire } from '../game-logic/schema/state.types';
import { createContext, useContext } from 'react';

const AdapterContext = createContext<GameAdapter<BaseGameStateWire> | null>(null);

export interface AdapterProviderProps {
  adapter: GameAdapter<BaseGameStateWire>;
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
export function AdapterProvider({ adapter, children }: AdapterProviderProps) {
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
export function useAdapter(): GameAdapter<BaseGameStateWire> {
  const adapter = useContext(AdapterContext);

  if (!adapter) {
    throw new Error(
      'useAdapter must be used within an AdapterProvider. '
      + 'Wrap your component tree with <AdapterProvider adapter={...}>',
    );
  }

  return adapter;
}
