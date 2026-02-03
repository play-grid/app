import type { Context } from 'hono';
import type { Env } from '@/env';

import { PostHog } from 'posthog-node';

export function getPostHog(env: Env) {
  return new PostHog(env.POSTHOG_PUBLIC_KEY, {
    host: env.POSTHOG_HOST,

    flushAt: 1,
    flushInterval: 0,

  });
}

export function captureEvent(
  c: Context,
  env: Env,
  data: Parameters<PostHog['capture']>[0],
) {
  const posthog = getPostHog(env);

  posthog.capture(data);

  c.executionCtx?.waitUntil(posthog.flush());
}

export function captureException(
  c: Context,
  env: Env,
  error: unknown,
  distinctId: string,
  properties: Record<string, any> = {},
) {
  const posthog = getPostHog(env);

  posthog.captureException(error, distinctId, properties);

  c.executionCtx?.waitUntil(posthog.flush());
}
