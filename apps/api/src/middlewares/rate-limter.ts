import type { Context, MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { TOO_MANY_REQUESTS } from 'stoker/http-status-codes';
import { TOO_MANY_REQUESTS as TOO_MANY_REQUESTS_PHRASE } from 'stoker/http-status-phrases';

const RATE_LIMIT_CONTEXT_KEY = '.rateLimited';

/**
 * Rate limiting binding as defined by Cloudflare Workers.
 * @see https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
 */
export interface RateLimitBinding {
  limit: (options: { key: string }) => Promise<{ success: boolean }>;
}

/**
 * Function that returns the key to rate limit on for a given request.
 * The key should represent a unique characteristic of a user or class of user.
 */
export type RateLimitKeyFunc = (c: Context) => string | Promise<string>;

export interface RateLimitOptions {
  rateLimiter: (c: Context) => RateLimitBinding;
  getRateLimitKey: RateLimitKeyFunc;
}

/**
 * Creates a rate limiting middleware for Hono applications.
 *
 * @param options - The rate limiting options
 * @returns Hono middleware handler
 *
 * @example
 * ```ts
 * app.use("*", rateLimit({
 *   rateLimiter: (c) => c.env.RATE_LIMITER,
 *   getRateLimitKey: (c) => c.req.header("Authorization") || "",
 * }));
 * ```
 */
export function rateLimit(options: RateLimitOptions): MiddlewareHandler {
  return createMiddleware(async (c, next) => {
    const binding = options.rateLimiter(c);
    const key = await options.getRateLimitKey(c);

    if (!key) {
      console.warn('the provided keyFunc returned an empty rate limiting key: bypassing rate limits');
      await next();
      return;
    }

    const { success } = await binding.limit({ key });
    c.set(RATE_LIMIT_CONTEXT_KEY, success);

    if (!success) {
      throw new HTTPException(TOO_MANY_REQUESTS, {
        res: new Response(TOO_MANY_REQUESTS_PHRASE, { status: TOO_MANY_REQUESTS }),
      });
    }

    await next();
  });
}

/**
 * Check if the current request passed rate limiting.
 * Returns true if the request was allowed through, false if it was rate limited,
 * or undefined if the rate limiting middleware was not applied.
 */
export function rateLimitPassed(c: Context): boolean | undefined {
  return c.get(RATE_LIMIT_CONTEXT_KEY) as boolean | undefined;
}
