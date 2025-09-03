import type { AppRouteHandler } from '../../lib/types';
import type { GetGameTypesRoute } from './game-type.routes';

export const getGameTypesHandler: AppRouteHandler<GetGameTypesRoute> = async (c) => {
  const gameTypes = [
    { id: 'logo-guess', name: 'Logo Guess' },
  ];

  return c.json(gameTypes);
};
