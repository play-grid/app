import type { BaseAction, BaseGameState, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';

import { createGameAdapter } from '@/lib/create-game-adapter';

let _adapter: any = null;

export function getOrCreateAdapter<
  TStateSchema extends z.ZodType<BaseGameState>,
  TActionSchema extends z.ZodType<BaseAction>,
>(
  gameDefinition: GameDefinition<TStateSchema, TActionSchema>,

  adapterConfig: Parameters<typeof createGameAdapter<TStateSchema, TActionSchema>>[1],
) {
  if (_adapter) {
    return _adapter as ReturnType<typeof createGameAdapter<TStateSchema, TActionSchema>>;
  }

  _adapter = createGameAdapter(gameDefinition, adapterConfig);

  return _adapter as ReturnType<typeof createGameAdapter<TStateSchema, TActionSchema>>;
}

export function destroyAdapter() {
  if (_adapter && typeof _adapter.disconnect === 'function') {
    _adapter.disconnect();
  }
  _adapter = null;
}
