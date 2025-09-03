/* eslint-disable ts/no-redeclare */
import type { AppOpenAPI } from '../lib/types';

import createRouter from '@/api/lib/create-router';

import { BASE_PATH } from '../lib/constants';
import gameRoom from './game-room/game-room.index';
import { registerGameTypeRoutes } from './game-type/game-type.index';
import index from './index.route';

export function registerRoutes(app: AppOpenAPI) {
  registerGameTypeRoutes(app);
  return app
    .route('/', index)
    .route('/', gameRoom);
}

// stand alone router type used for api client
export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
);
export type router = typeof router;
