import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFetcherRegistry } from './create-fetcher-registry';

describe('createFetcherRegistry', () => {
  const mockCache = {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  };

  const mockFetcher1 = vi.fn().mockResolvedValue([{ id: '1', name: 'test1' }]);
  const mockFetcher2 = vi.fn().mockResolvedValue([{ id: '2', name: 'test2' }]);

  beforeEach(() => {
    vi.clearAllMocks();
    mockCache.get.mockResolvedValue(null);
    mockFetcher1.mockClear();
    mockFetcher2.mockClear();
  });

  it('should return null for unregistered family', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    const result = registry.get('unknown-family', 'variant1');

    expect(result).toBeNull();
  });

  it('should return null for unregistered variant in registered family', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    registry.register('family1', 'variant1', mockFetcher1);

    const result = registry.get('family1', 'unknown-variant');

    expect(result).toBeNull();
  });

  it('should return fetcher for registered family and variant', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    registry.register('family1', 'variant1', mockFetcher1);

    const result = registry.get('family1', 'variant1');

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(Function);
  });

  it('should return different fetchers for different variants', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    registry.register('family1', 'variant1', mockFetcher1);
    registry.register('family1', 'variant2', mockFetcher2);

    const fetcher1 = registry.get('family1', 'variant1');
    const fetcher2 = registry.get('family1', 'variant2');

    expect(fetcher1).not.toBe(fetcher2);
  });

  it('should return same fetcher instance for same variant on multiple get() calls', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    registry.register('family1', 'variant1', mockFetcher1);

    const fetcher1 = registry.get('family1', 'variant1');
    const fetcher2 = registry.get('family1', 'variant1');
    const fetcher3 = registry.get('family1', 'variant1');

    expect(fetcher1).toBe(fetcher2);
    expect(fetcher1).toBe(fetcher3);
  });

  it('should return all fetchers for family via getAll()', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    registry.register('family1', 'variant1', mockFetcher1);
    registry.register('family1', 'variant2', mockFetcher2);

    const result = registry.getAll('family1');

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(2);
    expect(result.get('variant1')).toBeInstanceOf(Function);
    expect(result.get('variant2')).toBeInstanceOf(Function);
  });

  it('should return empty map for unregistered family via getAll()', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    const result = registry.getAll('unknown-family');

    expect(result).toBeInstanceOf(Map);
    expect(result.size).toBe(0);
  });

  it('should return catalog with all registered families and variants', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    registry.register('family1', 'variant1', mockFetcher1);
    registry.register('family1', 'variant2', mockFetcher2);
    registry.register('family2', 'variant1', mockFetcher1);

    const catalog = registry.getCatalog();

    expect(catalog).toEqual({
      family1: {
        variants: ['variant1', 'variant2'],
        defaultTtl: 60,
      },
      family2: {
        variants: ['variant1'],
        defaultTtl: 60,
      },
    });
  });

  it('should include metadata in catalog when provided', async () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    registry.register('family1', 'variant1', mockFetcher1, {
      ttl: 120,
      description: 'Test family',
      source: 'Test source',
    });

    const catalog = registry.getCatalog();

    expect(catalog.family1).toEqual({
      variants: ['variant1'],
      defaultTtl: 60,
      description: 'Test family',
      source: 'Test source',
    });
  });

  it('should use default TTL when not provided in options', () => {
    const registry = createFetcherRegistry({
      defaultTtl: 60,
      cacheNamespace: 'test',
      cache: mockCache as any,
    });

    registry.register('family1', 'variant1', mockFetcher1);

    const catalog = registry.getCatalog();

    expect(catalog.family1.defaultTtl).toBe(60);
  });
});
