import type { BaseAction, BaseGameState, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';

import { createGameAdapter } from './create-game-adapter';

let _adapter: any = null;
let _adapterIdentifier: string | null = null;

export function getOrCreateAdapter<
  TStateSchema extends z.ZodType<BaseGameState>,
  TActionSchema extends z.ZodType<BaseAction>,
>(
  gameDefinition: GameDefinition<TStateSchema, TActionSchema>,
  adapterConfig: Parameters<typeof createGameAdapter<TStateSchema, TActionSchema>>[1],
  identifier: string,
) {
  if (_adapter && _adapterIdentifier === identifier) {
    return _adapter as ReturnType<typeof createGameAdapter<TStateSchema, TActionSchema>>;
  }

  if (_adapter) {
    destroyAdapter();
  }

  _adapterIdentifier = identifier;
  _adapter = createGameAdapter(gameDefinition, adapterConfig);

  return _adapter as ReturnType<typeof createGameAdapter<TStateSchema, TActionSchema>>;
}

export function destroyAdapter() {
  if (_adapter) {
    if (typeof _adapter.disconnect === 'function') {
      _adapter.disconnect();
    }
  }
  _adapter = null;
  _adapterIdentifier = null;
}
