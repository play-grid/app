import type { Table } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

export interface SearchOptions {
  table: Table;
  searchFields: string[];
  searchTerm: string;
}

export function applySearch<T>(query: T, options: SearchOptions): T {
  const { searchFields, searchTerm } = options;

  if (!searchTerm || searchFields.length === 0) {
    return query;
  }

  const searchConditions = searchFields.map((field: string) =>
    sql`lower(${(options.table as any)[field]}) like ${`%${searchTerm.toLowerCase()}%`}`,
  );

  return (query as any).where(sql`(${sql.join(searchConditions, sql` or `)})`);
}

export function buildSearchCondition(searchFields: string[], searchTerm: string) {
  if (!searchTerm || searchFields.length === 0) {
    return undefined;
  }

  const conditions = searchFields.map((field: string) =>
    sql.raw(`lower(${field}) like ${`%${searchTerm.toLowerCase()}%`}`),
  );

  return sql.join(conditions, sql.raw(' or '));
}
