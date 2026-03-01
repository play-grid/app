import type { GameEffect, GameEffectContext } from '@playgrid/game-core';
import type { StatClashAction, StatClashErrorAction, StatItemsFetchedAction } from '../logic/schema';
import { logger } from '../logger';

export interface HttpClient {
  get: (path: string, params?: Record<string, string>) => Promise<Response>;
}

export function createHttpClient(apiUrl: string): HttpClient {
  const baseUrl = apiUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  return {
    get: async (path, params = {}) => {
      const url = new URL(path, baseUrl);
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
      return fetch(url.toString());
    },
  };
}

export function createFetchStatItemsEffect(httpClient: HttpClient): GameEffect {
  return async (ctx: GameEffectContext): Promise<StatItemsFetchedAction | StatClashErrorAction | null> => {
    const action = ctx.action as StatClashAction;

    if (action.type !== 'REQUEST_STAT_ITEMS')
      return null;

    try {
      const { category, metricType, limit = 80 } = action.payload;
      const params = new URLSearchParams({ status: 'approved', limit: String(limit) });

      if (category && category !== 'mixed')
        params.set('category', category);

      if (metricType)
        params.set('metricType', metricType);

      if (!ctx.apiUrl && typeof window === 'undefined') {
        logger.error('[FetchStatItemsEffect] ctx.apiUrl is not set');
        return {
          type: 'STAT_ITEMS_FETCHED',
          payload: {
            items: [],
            error: 'API URL not configured. Please contact support.',
          },
        };
      }

      const queryParams = Object.fromEntries(params.entries());
      logger.debug(`[FetchStatItemsEffect] Fetching items with params: ${JSON.stringify(queryParams)}`);
      const res = await httpClient.get('/api/data/stat-items', queryParams);

      if (!res.ok) {
        const errorText = await res.text().catch(() => `HTTP ${res.status}`);
        logger.error(`[FetchStatItemsEffect] API error: ${res.status} - ${errorText}`);

        return {
          type: 'STAT_ITEMS_FETCHED',
          payload: {
            items: [],
            error: `Failed to load stat items (HTTP ${res.status}). Please check your connection and try again.`,
          },
        };
      }

      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        logger.warn('[FetchStatItemsEffect] No items available matching current filters');
        return {
          type: 'STAT_ITEMS_FETCHED',
          payload: {
            items: [],
            error: 'No items available with current settings. Try changing category or metric type.',
          },
        };
      }

      logger.debug(`[FetchStatItemsEffect] Successfully fetched ${data.items.length} items`);
      return {
        type: 'STAT_ITEMS_FETCHED',
        payload: { items: data.items },
      };
    }
    catch (error) {
      logger.error('[FetchStatItemsEffect] Unexpected error:', error);
      const isNetworkError = error instanceof TypeError && error.message.includes('fetch');

      return {
        type: 'STAT_ITEMS_FETCHED',
        payload: {
          items: [],
          error: isNetworkError
            ? 'Network connection failed. Please check your internet connection and try again.'
            : 'An unexpected error occurred while loading items. Please try again.',
        },
      };
    }
  };
}

export function createStatClashEffects(apiUrl = ''): GameEffect[] {
  return [createFetchStatItemsEffect(createHttpClient(apiUrl))];
}
