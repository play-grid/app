import type { AppRouteHandler } from '../../lib/types';
import type { ListGameTypesRoute } from './game-types.routes';
import { getGameDefinition, getRegisteredGameIds } from '@guess-logo/game-core';

export const listGameTypesHandler: AppRouteHandler<ListGameTypesRoute> = (
  c,
) => {
  const gameIds = getRegisteredGameIds();

  const gameTypes = gameIds.map((id) => {
    const definition = getGameDefinition(id);
    if (!definition) {
      throw new Error(`Game ${id} registered but definition missing`);
    }

    return {
      id: definition.meta.id,
      name: definition.meta.name,
      minPlayers: definition.meta.minPlayers,
      maxPlayers: definition.meta.maxPlayers,
    };
  });

  return c.json(gameTypes);
};
