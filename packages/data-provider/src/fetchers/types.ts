import type { SupportedLanguage } from '@guess-logo/shared/types';

export type Fetcher<TData> = (language: SupportedLanguage) => Promise<TData>;

export interface KVCache {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
}

export interface FetcherRegistryConfig<_TData, _TFamily extends string> {
  defaultTtl: number;
  cacheNamespace: string;
  cache: KVCache;
}

export interface FetcherRegistration<TData> {
  fetcher: Fetcher<TData>;
  ttl: number;
  cachedAt?: Date;
}

export interface CatalogEntry {
  variants: string[];
  defaultTtl: number;
  description?: string;
  source?: string;
  lastUpdated?: string;
}

export type Catalog = Record<string, CatalogEntry>;
