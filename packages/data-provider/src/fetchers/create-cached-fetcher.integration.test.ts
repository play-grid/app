import type { KVCache } from './create-cached-fetcher';
import type { Fetcher } from './types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCachedFetcher } from './create-cached-fetcher';

describe('createCachedFetcher', () => {
  let mockGet: ReturnType<typeof vi.fn<(key: string) => Promise<string | null>>>;
  let mockPut: ReturnType<typeof vi.fn<(key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>>>;
  let mockCache: KVCache;
  let mockFetcher: Fetcher<any>;

  beforeEach(() => {
    mockGet = vi.fn().mockResolvedValue(null);
    mockPut = vi.fn().mockResolvedValue(undefined);

    mockCache = {
      get: mockGet,
      put: mockPut,
    };

    mockFetcher = vi.fn() as Fetcher<any>;
  });

  it('should return cached value on cache hit', async () => {
    const cachedData = { id: '1', name: 'test' };
    mockGet.mockResolvedValue(JSON.stringify(cachedData));

    const fetcher = createCachedFetcher(mockFetcher, {
      cacheKey: 'test-key',
      ttl: 60,
      cache: mockCache,
    });

    const result = await fetcher('en');

    expect(mockGet).toHaveBeenCalledWith('test-key:en');
    expect(mockFetcher).not.toHaveBeenCalled();
    expect(result).toEqual(cachedData);
  });

  it('should call fetcher and cache result on cache miss', async () => {
    const freshData = { id: '2', name: 'fresh' };
    mockGet.mockResolvedValue(null);
    (mockFetcher as ReturnType<typeof vi.fn>).mockResolvedValue(freshData);
    mockPut.mockResolvedValue(undefined);

    const fetcher = createCachedFetcher(mockFetcher, {
      cacheKey: 'test-key',
      ttl: 60,
      cache: mockCache,
    });

    const result = await fetcher('en');

    expect(mockGet).toHaveBeenCalledWith('test-key:en');
    expect(mockFetcher).toHaveBeenCalledWith('en');
    expect(mockPut).toHaveBeenCalledWith(
      'test-key:en',
      JSON.stringify(freshData),
      { expirationTtl: 60 },
    );
    expect(result).toEqual(freshData);
  });

  it('should include language in cache key', async () => {
    mockGet.mockResolvedValue(null);
    (mockFetcher as ReturnType<typeof vi.fn>).mockResolvedValue({ data: 'test' });
    mockPut.mockResolvedValue(undefined);

    const fetcher = createCachedFetcher(mockFetcher, {
      cacheKey: 'test-key',
      ttl: 60,
      cache: mockCache,
    });

    await fetcher('en');
    await fetcher('ar');

    expect(mockGet).toHaveBeenNthCalledWith(1, 'test-key:en');
    expect(mockGet).toHaveBeenNthCalledWith(2, 'test-key:ar');
    expect(mockPut).toHaveBeenNthCalledWith(1, 'test-key:en', expect.anything(), { expirationTtl: 60 });
    expect(mockPut).toHaveBeenNthCalledWith(2, 'test-key:ar', expect.anything(), { expirationTtl: 60 });
  });
});
