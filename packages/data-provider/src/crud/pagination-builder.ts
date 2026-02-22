import type { PaginationParams } from '../types';

export function applyPagination<T>(
  query: T,
  { page, limit }: PaginationParams,
): T {
  const offset = (page - 1) * limit;
  return (query as any).limit(limit).offset(offset);
}

export function createPaginationMeta(
  total: number,
  { page, limit }: PaginationParams,
): { page: number; limit: number; total: number; totalPages: number } {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
