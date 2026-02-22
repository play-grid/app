import type { SQL, Table } from 'drizzle-orm';
import type { FilterParams, WhereCondition } from '../types';
import { and } from 'drizzle-orm';

export interface FilterMap {
  [fieldName: string]: (value: any) => SQL;
}

export function applyFilters<T>(
  query: T,
  filters: FilterParams,
  filterMap: FilterMap,
): T {
  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && filterMap[key]) {
      conditions.push(filterMap[key](value));
    }
  }

  if (conditions.length === 0) {
    return query;
  }

  return (query as any).where(and(...conditions));
}

export function buildWhereCondition<T extends Table>(
  table: T,
  filters: FilterParams,
  filterMap: FilterMap,
): WhereCondition | undefined {
  const conditions: SQL[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && filterMap[key]) {
      conditions.push(filterMap[key](value));
    }
  }

  if (conditions.length === 0) {
    return undefined;
  }

  return and(...conditions);
}
