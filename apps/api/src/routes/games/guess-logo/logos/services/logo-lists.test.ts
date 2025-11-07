import { describe, expect, it } from 'vitest';
import { fetchLogoLists } from './logo-lists-service';

describe('fetchLogoLists', () => {
  it('should return companies lists', async () => {
    const lists = await fetchLogoLists('companies');
    expect(lists).toBeDefined();
    expect(lists.length).toBeGreaterThan(0);
  });

  it('should return movies lists', async () => {
    const lists = await fetchLogoLists('movies');
    expect(lists).toBeDefined();
    expect(lists.length).toBeGreaterThan(0);
  });

  it('should return countries lists', async () => {
    const lists = await fetchLogoLists('countries');
    expect(lists).toBeDefined();
    expect(lists.length).toBeGreaterThan(0);
  });

  it('should return empty array for unknown set', async () => {
    const lists = await fetchLogoLists('unknown' as any);
    expect(lists).toBeDefined();
    expect(lists.length).toBe(0);
  });
});
