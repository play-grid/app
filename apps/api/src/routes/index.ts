/* eslint-disable ts/no-redeclare */
import type { AppOpenAPI } from '../lib/types';

import createRouter from '@/api/lib/create-router';

import { BASE_PATH } from '../lib/constants';
import gameRoom from './game-room/game-room.index';
import gameType from './game-type/game-type.index';
import index from './index.route';
import logos from './logos/logos.index';

export function registerRoutes(app: AppOpenAPI) {
  return app
    .route('/', index)
    .route('/', gameRoom)
    .route('/', gameType)
    .route('/', logos);
}

// stand alone router type used for api client
export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
);
export type router = typeof router;
