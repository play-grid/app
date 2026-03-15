import type { OpenAPIHono, RouteConfig, RouteHandler } from '@hono/zod-openapi';

import type { Session, User as BetterAuthUser } from 'better-auth/types';
import type { PinoLogger } from 'hono-pino';
import type { GameSessionObject } from '../durable-objects/game-session/game-session.object';
import type { BASE_PATH } from './constants';
import type { Env } from '@/env';

export interface User extends BetterAuthUser {
  role: string;
  username: string;
  displayUsername: string;
  isAnonymous: boolean;
}

// Cloudflare-specific bindings only
export interface CloudflareBindings {
  ASSETS: Fetcher;
  LOGO_CACHE: KVNamespace;
  QUESTIONS: KVNamespace;
  PLAY_GRID_BUCKET: R2Bucket;
  AI: Ai;
  Variables: {
    userId?: string;
    user?: User;
    session?: Session;
    logger: PinoLogger;
  };
  GAME_SESSION: DurableObjectNamespace<GameSessionObject>;
  GAME_HUB_DB: D1Database;
  BETTER_AUTH_URL: string;
  ALLOWED_ORIGINS: string;
  API_URL: string;
  R2_PUBLIC_URL: string;
}

export type FullBindings = Env & CloudflareBindings;

// For Hono (main Worker only)
export interface AppEnv {
  Bindings: FullBindings;
  Variables: {
    user: User | null;
    session: Session | null;
  };
}

export interface AuthSession {
  user: User;
  session: Session;
}

// eslint-disable-next-line ts/no-empty-object-type
export type AppOpenAPI = OpenAPIHono<AppEnv, {}, typeof BASE_PATH>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<R, AppEnv>;
