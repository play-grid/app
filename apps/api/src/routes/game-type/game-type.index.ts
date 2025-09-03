import type { AppOpenAPI } from '../../lib/types';
import { getGameTypesHandler } from './game-type.handlers';
import { getGameTypes } from './game-type.routes';

export function registerGameTypeRoutes(app: AppOpenAPI) {
  app.get(getGameTypes.path, getGameTypesHandler);
}
