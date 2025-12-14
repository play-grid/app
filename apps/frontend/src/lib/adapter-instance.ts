import type { BaseAction, BaseGameState, GameDefinition } from '@guess-logo/game-core';
import type z from 'zod';

import { logger } from '@/utils/logger';
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
    logger.debug(`[Adapter] Returning existing adapter for identifier: ${identifier}`);
    return _adapter as ReturnType<typeof createGameAdapter<TStateSchema, TActionSchema>>;
  }

  if (_adapter) {
    logger.debug(`[Adapter] Identifier changed from "${_adapterIdentifier}" to "${identifier}". Destroying old adapter.`);
    destroyAdapter();
  }

  logger.debug(`[Adapter] Creating new adapter for identifier: ${identifier}`);
  _adapterIdentifier = identifier;
  _adapter = createGameAdapter(gameDefinition, adapterConfig);

  return _adapter as ReturnType<typeof createGameAdapter<TStateSchema, TActionSchema>>;
}

export function destroyAdapter() {
  if (_adapter) {
    logger.debug(`[Adapter] Destroying adapter with identifier: "${_adapterIdentifier}"`);
    if (typeof _adapter.disconnect === 'function') {
      _adapter.disconnect();
    }
  }
  _adapter = null;
  _adapterIdentifier = null;
}
