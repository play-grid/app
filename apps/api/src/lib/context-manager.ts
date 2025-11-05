import type { Context } from 'hono';
import type { AppEnv } from '@/lib/types';

// Store the current request context
let currentContext: Context<AppEnv> | null = null;

export function setRequestContext(c: Context<AppEnv>) {
  currentContext = c;
}

export function getRequestContext(): Context<AppEnv> {
  if (!currentContext) {
    throw new Error('Request context not available. Make sure middleware is set up.');
  }
  return currentContext;
}

export function clearRequestContext() {
  currentContext = null;
}

// Helper to get just the env
export function getEnv() {
  return getRequestContext().env;
}
