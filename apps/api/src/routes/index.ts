/* eslint-disable ts/no-redeclare */
import type { AppOpenAPI } from '../lib/types';

import createRouter from '@/lib/create-router';

import { BASE_PATH } from '../lib/constants';
import { adminRoutes } from './admin';
import auth from './auth/auth.index';
import gameRoom from './game-room/game-room.index';
import gameType from './game-type/game-types.index';
import { gamesRoutes } from './games';
import health from './health/health.index';

import index from './index.route';

export function registerRoutes(app: AppOpenAPI) {
  return app
    .route('/', index)
    .route('/', auth)
    .route('/', health)
    .route('/', gameRoom)
    .route('/', gameType)
    .route('/games', gamesRoutes)
    .route('/admin', adminRoutes);
}

// stand alone router type used for api client
export const router = registerRoutes(
  createRouter().basePath(BASE_PATH),
);
export type router = typeof router;
