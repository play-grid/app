import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';

import type { BASE_PATH } from './constants';
import type { GameRoomDurableObject } from './game-room.do';
import type { auth } from '@/auth';
import type { Env } from '@/env';

// Cloudflare-specific bindings only
export interface CloudflareBindings {
  ASSETS: Fetcher;
  LOGO_CACHE: KVNamespace;
  RATE_LIMIT: KVNamespace;
  QUESTIONS: KVNamespace;
  GAME_ROOM: DurableObjectNamespace<GameRoomDurableObject>;
  GAME_HUB_DB: D1Database;
  ALLOWED_ORIGINS: string;
}

// Automatically merge Env (from Zod schema) with Cloudflare bindings
export interface AppEnv {
  Bindings: Env & CloudflareBindings;
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI = OpenAPIHono<AppEnv, {}, typeof BASE_PATH>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>;
