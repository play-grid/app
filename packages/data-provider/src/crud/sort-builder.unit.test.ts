import { asc, desc } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { applySorting } from './sort-builder';

vi.mock('drizzle-orm', () => ({
  asc: vi.fn((field: any) => ({ type: 'asc', field })),
  desc: vi.fn((field: any) => ({ type: 'desc', field })),
}));

describe('sort-builder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applySorting', () => {
    it('should return query when no sort field provided', () => {
      const mockQuery = {
        orderBy: vi.fn().mockReturnThis(),
      };

      const sortFields = {
        name: 'mock_asc',
        createdAt: 'mock_desc',
      };

      const result = applySorting(mockQuery as any, 'invalid_field', 'asc', sortFields);

      expect(mockQuery.orderBy).not.toHaveBeenCalled();
      expect(result).toBe(mockQuery);
    });

    it('should apply ascending order', () => {
      const mockQuery = {
        orderBy: vi.fn().mockReturnThis(),
      };

      const sortFields = {
        name: 'mock_asc',
      };

      const result = applySorting(mockQuery as any, 'name', 'asc', sortFields);

      expect(asc).toHaveBeenCalledWith('mock_asc');
      expect(mockQuery.orderBy).toHaveBeenCalledWith({ type: 'asc', field: 'mock_asc' });
      expect(result).toBe(mockQuery);
    });

    it('should apply descending order', () => {
      const mockQuery = {
        orderBy: vi.fn().mockReturnThis(),
      };

      const sortFields = {
        name: 'mock_desc',
      };

      const result = applySorting(mockQuery as any, 'name', 'desc', sortFields);

      expect(desc).toHaveBeenCalledWith('mock_desc');
      expect(mockQuery.orderBy).toHaveBeenCalledWith({ type: 'desc', field: 'mock_desc' });
      expect(result).toBe(mockQuery);
    });

    it('should handle different sort fields', () => {
      const mockQuery = {
        orderBy: vi.fn().mockReturnThis(),
      };

      const sortFields = {
        name: 'mock_name_asc',
        createdAt: 'mock_created_desc',
      };

      applySorting(mockQuery as any, 'name', 'asc', sortFields);
      expect(asc).toHaveBeenCalledWith('mock_name_asc');
      expect(mockQuery.orderBy).toHaveBeenCalledWith({ type: 'asc', field: 'mock_name_asc' });

      applySorting(mockQuery as any, 'createdAt', 'desc', sortFields);
      expect(desc).toHaveBeenCalledWith('mock_created_desc');
      expect(mockQuery.orderBy).toHaveBeenCalledWith({ type: 'desc', field: 'mock_created_desc' });
    });

    it('should return query for chaining', () => {
      const mockQuery = {
        orderBy: vi.fn().mockReturnThis(),
      };

      const sortFields = {
        name: 'mock_asc',
      };

      const result = applySorting(mockQuery as any, 'name', 'asc', sortFields);

      expect(result).toBe(mockQuery);
    });
  });
});
