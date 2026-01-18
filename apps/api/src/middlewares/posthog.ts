import type { Context } from 'hono';

import { PostHog } from 'posthog-node';

import { getNodeEnv } from '@/env';

const env = getNodeEnv();

export function getPostHog(_c: Context) {
  return new PostHog(env.POSTHOG_PUBLIC_KEY, {
    host: env.POSTHOG_HOST,

    flushAt: 1,
    flushInterval: 0,

  });
}

export function captureEvent(
  c: Context,
  data: Parameters<PostHog['capture']>[0],
) {
  const posthog = getPostHog(c);

  posthog.capture(data);

  c.executionCtx?.waitUntil(posthog.flush());
}

export function captureException(
  c: Context,
  error: unknown,
  distinctId: string,
  properties: Record<string, any> = {},
) {
  const posthog = getPostHog(c);

  posthog.captureException(error, distinctId, properties);

  c.executionCtx?.waitUntil(posthog.flush());
}
