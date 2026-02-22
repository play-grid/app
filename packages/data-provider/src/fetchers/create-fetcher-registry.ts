import type { Catalog, Fetcher, FetcherRegistryConfig, KVCache } from './types';
import { createCachedFetcher } from './create-cached-fetcher';

interface CachedFetcherRegistration<TData> {
  cachedFetcher: Fetcher<TData>;
  ttl: number;
  cachedAt: Date;
  metadata?: {
    description?: string;
    source?: string;
    lastUpdated?: string;
  };
}

export interface FetcherRegistry<TData, TFamily extends string> {
  register: (family: TFamily, variant: string, fetcher: Fetcher<TData>, options?: { ttl?: number; description?: string; source?: string }) => void;
  get: (family: TFamily, variant: string) => Fetcher<TData> | null;
  getAll: (family: TFamily) => Map<string, Fetcher<TData>>;
  getCatalog: () => Catalog;
}

export function createFetcherRegistry<TData, TFamily extends string>(
  config: FetcherRegistryConfig<TData, TFamily> & { cache: KVCache },
): FetcherRegistry<TData, TFamily> {
  const REGISTRY = new Map<TFamily, Map<string, CachedFetcherRegistration<TData>>>();

  const register: FetcherRegistry<TData, TFamily>['register'] = (
    family,
    variant,
    fetcher,
    options = {},
  ) => {
    if (!REGISTRY.has(family)) {
      REGISTRY.set(family, new Map());
    }

    const ttl = options.ttl ?? config.defaultTtl;
    const familyMap = REGISTRY.get(family)!;

    familyMap.set(variant, {
      cachedFetcher: createCachedFetcher(fetcher, {
        cacheKey: `${config.cacheNamespace}:${family}:${variant}`,
        ttl,
        cache: config.cache,
      }),
      ttl,
      cachedAt: new Date(),
      metadata: {
        description: options.description,
        source: options.source,
        lastUpdated: new Date().toISOString(),
      },
    });
  };

  const get: FetcherRegistry<TData, TFamily>['get'] = (family, variant) => {
    const familyMap = REGISTRY.get(family);
    if (!familyMap) {
      return null;
    }

    const registration = familyMap.get(variant);
    if (!registration) {
      return null;
    }

    return registration.cachedFetcher;
  };

  const getAll: FetcherRegistry<TData, TFamily>['getAll'] = (family) => {
    const familyMap = REGISTRY.get(family);
    if (!familyMap) {
      return new Map();
    }

    const result = new Map<string, Fetcher<TData>>();

    familyMap.forEach((registration, variant) => {
      result.set(variant, registration.cachedFetcher);
    });

    return result;
  };

  const getCatalog: FetcherRegistry<TData, TFamily>['getCatalog'] = () => {
    const catalog: Catalog = {};

    REGISTRY.forEach((variants, family) => {
      const firstRegistration = Array.from(variants.values())[0];
      catalog[family] = {
        variants: Array.from(variants.keys()),
        defaultTtl: config.defaultTtl,
        ...firstRegistration?.metadata,
      };
    });

    return catalog;
  };

  return {
    register,
    get,
    getAll,
    getCatalog,
  };
}
