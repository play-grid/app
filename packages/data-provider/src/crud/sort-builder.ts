import type { SortParams } from '../types';
import { asc, desc } from 'drizzle-orm';

export type SortFields = Record<string, any>;

export function applySorting<T>(
  query: T,
  sort: string,
  order: 'asc' | 'desc',
  sortFields: SortFields,
): T {
  const sortField = sortFields[sort];

  if (!sortField) {
    return query;
  }

  const orderFn = order === 'asc' ? asc : desc;
  return (query as any).orderBy(orderFn(sortField));
}
