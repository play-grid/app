import type { Table } from 'drizzle-orm';
import type { z } from 'zod';
import type {
  AdminListQuery,
  PaginationResponse,
} from '../types';

import { eq, sql } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { applyFilters } from './filter-builder';
import { applyPagination, createPaginationMeta } from './pagination-builder';
import { applySorting } from './sort-builder';

export interface CRUDHandlerOptions<_T extends Table> {
  searchFields?: string[];
  filterMap?: Record<string, (value: any) => any>;
  sortFields?: Record<string, any>;
  relations?: Record<string, any>;
  softDelete?: boolean;
  deleteField?: string;
}

export interface CRUDHandlers {
  list: (c: any) => Promise<any>;
  getOne: (c: any) => Promise<any>;
  create: (c: any) => Promise<any>;
  update: (c: any) => Promise<any>;
  delete: (c: any) => Promise<any>;
}

export function createCRUDHandlers<
  TTable extends Table,
  TData extends Record<string, any>,
>(
  table: TTable,
  outputSchema: z.ZodType<TData>,
  options: CRUDHandlerOptions<TTable> = {},
): CRUDHandlers {
  const {
    searchFields = [],
    filterMap = {},
    sortFields = {},
    softDelete = false,
    deleteField = 'deletedAt',
  } = options;

  return {
    list: async (c: any) => {
      const db = c.get('db');
      const query = c.req.valid('query') as AdminListQuery;
      const { page = 1, limit = 10, search, sort, order = 'asc', ...filters } = query;

      try {
        let queryBuilder = db.select().from(table);

        if (softDelete) {
          queryBuilder = queryBuilder.where(eq((table as any)[deleteField], null));
        }

        if (search && searchFields.length > 0) {
          const searchConditions = searchFields.map((field: string) =>
            sql`lower(${(table as any)[field]}) like ${`%${search.toLowerCase()}%`}`,
          );
          queryBuilder = queryBuilder.where(sql`(${sql.join(searchConditions, sql` or `)})`);
        }

        const filteredQuery = applyFilters(queryBuilder, filters, filterMap);

        const sortedQuery = sort && sortFields[sort]
          ? applySorting(filteredQuery, sort, order, sortFields as any)
          : filteredQuery;

        const paginatedQuery = applyPagination(sortedQuery, { page, limit });

        const data = await paginatedQuery;

        const countQuery = db.select({ count: sql<number>`count(*)` }).from(table);

        const whereCondition = softDelete
          ? eq((table as any)[deleteField], null)
          : undefined;

        const countResult = await countQuery.where(whereCondition);
        const total = countResult[0]?.count || 0;

        const pagination = createPaginationMeta(total, { page, limit });

        const parsedData = data.map((item: unknown) => outputSchema.parse(item));

        return c.json(
          {
            data: parsedData,
            pagination,
          } satisfies PaginationResponse<TData>,
          HttpStatusCodes.OK,
        );
      }
      catch (error) {
        return c.json(
          { error: 'Failed to fetch data', details: error instanceof Error ? error.message : 'Unknown error' },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    },

    getOne: async (c: any) => {
      const db = c.get('db');
      const { id } = c.req.valid('param');

      try {
        let queryBuilder = db.select().from(table).where(eq((table as any).id, id)).limit(1);

        if (softDelete) {
          queryBuilder = queryBuilder.where(eq((table as any)[deleteField], null));
        }

        const [item] = await queryBuilder;

        if (!item) {
          return c.json({ error: 'Not found' }, HttpStatusCodes.NOT_FOUND);
        }

        const parsedItem = outputSchema.parse(item);

        return c.json(parsedItem, HttpStatusCodes.OK);
      }
      catch {
        return c.json(
          { error: 'Failed to fetch item' },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    },

    create: async (c: any) => {
      const db = c.get('db');
      const input = c.req.valid('json');

      try {
        const [newItem] = await db.insert(table).values(input).returning();

        const parsedItem = outputSchema.parse(newItem);

        return c.json(parsedItem, HttpStatusCodes.CREATED);
      }
      catch (error) {
        return c.json(
          { error: 'Failed to create item', details: error instanceof Error ? error.message : 'Unknown error' },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    },

    update: async (c: any) => {
      const db = c.get('db');
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');

      try {
        let queryBuilder = db.update(table).set(input).where(eq((table as any).id, id));

        if (softDelete) {
          queryBuilder = queryBuilder.where(eq((table as any)[deleteField], null));
        }

        const [updatedItem] = await queryBuilder.returning();

        if (!updatedItem) {
          return c.json({ error: 'Not found' }, HttpStatusCodes.NOT_FOUND);
        }

        const parsedItem = outputSchema.parse(updatedItem);

        return c.json(parsedItem, HttpStatusCodes.OK);
      }
      catch (error) {
        return c.json(
          { error: 'Failed to update item', details: error instanceof Error ? error.message : 'Unknown error' },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    },

    delete: async (c: any) => {
      const db = c.get('db');
      const { id } = c.req.valid('param');

      try {
        if (softDelete) {
          const [deletedItem] = await db
            .update(table)
            .set({ [deleteField]: new Date() })
            .where(eq((table as any).id, id))
            .returning();

          if (!deletedItem) {
            return c.json({ error: 'Not found' }, HttpStatusCodes.NOT_FOUND);
          }

          return c.json(deletedItem, HttpStatusCodes.OK);
        }

        const [deletedItem] = await db.delete(table).where(eq((table as any).id, id)).returning();

        if (!deletedItem) {
          return c.json({ error: 'Not found' }, HttpStatusCodes.NOT_FOUND);
        }

        return c.json({ success: true }, HttpStatusCodes.OK);
      }
      catch (error) {
        return c.json(
          { error: 'Failed to delete item', details: error instanceof Error ? error.message : 'Unknown error' },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    },
  };
}
