import type { SupportedLanguage } from '@guess-logo/shared/types';
import type { Fetcher, KVCache } from './types';

export interface CachedFetcherOptions {
  cacheKey: string;
  ttl: number;
  cache: KVCache;
}

export function createCachedFetcher<TData>(
  fetcher: Fetcher<TData>,
  options: CachedFetcherOptions,
): Fetcher<TData> {
  return async (language: SupportedLanguage) => {
    const cacheKey = `${options.cacheKey}:${language}`;
    const cached = await options.cache.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as TData;
    }

    const data = await fetcher(language);
    await options.cache.put(cacheKey, JSON.stringify(data), { expirationTtl: options.ttl });

    return data;
  };
}

export type { KVCache };
