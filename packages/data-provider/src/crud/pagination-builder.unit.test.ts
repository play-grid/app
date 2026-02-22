import { describe, expect, it, vi } from 'vitest';
import { applyPagination, createPaginationMeta } from './pagination-builder';

describe('pagination-builder', () => {
  describe('applyPagination', () => {
    it('should apply offset for page 1', () => {
      const mockQuery = {
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
      };

      const result = applyPagination(mockQuery as any, { page: 1, limit: 10 });

      expect(mockQuery.offset).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toBe(mockQuery);
    });

    it('should apply offset for page 2', () => {
      const mockQuery = {
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
      };

      const result = applyPagination(mockQuery as any, { page: 2, limit: 10 });

      expect(mockQuery.offset).toHaveBeenCalledWith(10);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toBe(mockQuery);
    });

    it('should apply offset for page 3', () => {
      const mockQuery = {
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
      };

      const result = applyPagination(mockQuery as any, { page: 3, limit: 10 });

      expect(mockQuery.offset).toHaveBeenCalledWith(20);
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(result).toBe(mockQuery);
    });
  });

  describe('createPaginationMeta', () => {
    it('should calculate correct pagination for 10 items, page 1, limit 10', () => {
      const result = createPaginationMeta(10, { page: 1, limit: 10 });

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 10,
        totalPages: 1,
      });
    });

    it('should calculate correct pagination for 10 items, page 1, limit 5', () => {
      const result = createPaginationMeta(10, { page: 1, limit: 5 });

      expect(result).toEqual({
        page: 1,
        limit: 5,
        total: 10,
        totalPages: 2,
      });
    });

    it('should calculate correct pagination for 10 items, page 2, limit 5', () => {
      const result = createPaginationMeta(10, { page: 2, limit: 5 });

      expect(result).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2,
      });
    });

    it('should handle empty results', () => {
      const result = createPaginationMeta(0, { page: 1, limit: 10 });

      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      });
    });

    it('should handle 0 total with Math.ceil', () => {
      const result = createPaginationMeta(0, { page: 1, limit: 10 });

      expect(result.totalPages).toBe(1);
    });
  });
});
