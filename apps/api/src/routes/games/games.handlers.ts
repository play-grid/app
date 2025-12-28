import type { AppRouteHandler } from '../../lib/types';
import type { ListGamesMetaRoute } from './games.routes';
import { getGameDefinition, getRegisteredGameIds } from '@guess-logo/game-core';

export const listGamesHandler: AppRouteHandler<ListGamesMetaRoute> = (
  c,
) => {
  const gameIds = getRegisteredGameIds();

  const games = gameIds.map((id) => {
    const definition = getGameDefinition(id);
    if (!definition) {
      throw new Error(`Game ${id} registered but definition missing`);
    }

    return definition.meta;
  });

  return c.json(games);
};
