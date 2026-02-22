import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applyFilters } from './filter-builder';

vi.mock('drizzle-orm', () => ({
  and: vi.fn((...conditions: any[]) => ({ type: 'and', conditions })),
}));

describe('filter-builder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applyFilters', () => {
    it('should apply no filters when filters object is empty', () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
      };

      const result = applyFilters(mockQuery as any, {}, {});

      expect(mockQuery.where).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it('should apply single filter', () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
      };

      const filterMap = {
        status: (value: any) => ({ eq: 'mock_eq', value }),
      } as any;

      const result = applyFilters(mockQuery as any, { status: 'active' }, filterMap);

      expect(mockQuery.where).toHaveBeenCalledWith({ type: 'and', conditions: [{ eq: 'mock_eq', value: 'active' }] });
      expect(result).toBe(mockQuery);
    });

    it('should apply multiple filters', () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
      };

      const filterMap = {
        status: (value: any) => ({ eq: 'status_eq', value }),
        category: (value: any) => ({ eq: 'category_eq', value }),
      } as any;

      const result = applyFilters(mockQuery as any, { status: 'active', category: 'sports' }, filterMap);

      expect(mockQuery.where).toHaveBeenCalledWith({
        type: 'and',
        conditions: [
          { eq: 'status_eq', value: 'active' },
          { eq: 'category_eq', value: 'sports' },
        ],
      });
      expect(result).toBe(mockQuery);
    });

    it('should skip undefined filter values', () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
      };

      const filterMap = {
        status: (value: any) => ({ eq: 'status_eq', value }),
        category: (value: any) => ({ eq: 'category_eq', value }),
      } as any;

      const result = applyFilters(mockQuery as any, { status: 'active', category: undefined }, filterMap);

      expect(mockQuery.where).toHaveBeenCalledTimes(1);
      expect(mockQuery.where).toHaveBeenCalledWith({ type: 'and', conditions: [{ eq: 'status_eq', value: 'active' }] });
      expect(result).toBe(mockQuery);
    });

    it('should skip null filter values', () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
      };

      const filterMap = {
        status: (value: any) => ({ eq: 'status_eq', value }),
        category: (value: any) => ({ eq: 'category_eq', value }),
      } as any;

      const result = applyFilters(mockQuery as any, { status: 'active', category: null }, filterMap);

      expect(mockQuery.where).toHaveBeenCalledTimes(1);
      expect(mockQuery.where).toHaveBeenCalledWith({ type: 'and', conditions: [{ eq: 'status_eq', value: 'active' }] });
      expect(result).toBe(mockQuery);
    });

    it('should return query for chaining', () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
      };

      const filterMap = {
        status: (value: any) => ({ eq: 'status_eq', value }),
      } as any;

      const result = applyFilters(mockQuery as any, { status: 'active' }, filterMap);

      expect(result).toBe(mockQuery);
    });
  });
});
