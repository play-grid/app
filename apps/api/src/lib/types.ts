import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';

import type { BASE_PATH } from './constants';
import type { GameRoomDurableObject } from './game-room.do';

export interface AppEnv {
  Bindings: {
    ASSETS: Fetcher;
    GAME_ROOM: DurableObjectNamespace<GameRoomDurableObject>;
  };
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI = OpenAPIHono<AppEnv, {}, typeof BASE_PATH>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>;
