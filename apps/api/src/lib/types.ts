import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';

import type { BASE_PATH } from './constants';
import type { GameRoomDurableObject } from './game-room.do';
import type { Env } from '@/env';

export interface AppEnv extends Env {
  Bindings: {
    ASSETS: Fetcher;
    LOGO_CACHE: KVNamespace;
    RATE_LIMIT: KVNamespace;
    QUESTIONS: KVNamespace;
    GAME_ROOM: DurableObjectNamespace<GameRoomDurableObject>;
    GAME_HUB_DB: D1Database;
    ALLOWED_ORIGINS: string;
  };
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI = OpenAPIHono<AppEnv, {}, typeof BASE_PATH>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>;
