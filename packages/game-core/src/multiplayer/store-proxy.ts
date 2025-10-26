import type { GameStore, Player } from '../types/core';

export function createStoreProxy<TSettings, TPlayer extends Player>(
  store: GameStore<TSettings, TPlayer>,
  orpcClient?: any,
) {
  const proxy = new Proxy(store, {
    get: (target, prop, receiver) => {
      // If oRPC client is available and the prop is a function, forward the call
      if (orpcClient && typeof (target as any)[prop] === 'function') {
        return (...args: any[]) => {
          if (orpcClient[prop]) {
            return orpcClient[prop](...args);
          }
          // Fallback to local store if method not on oRPC client
          return (target as any)[prop](...args);
        };
      }

      // Otherwise, return the original property
      return Reflect.get(target, prop, receiver);
    },
  });

  return proxy;
}
