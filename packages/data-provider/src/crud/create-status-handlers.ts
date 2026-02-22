import type { Table } from 'drizzle-orm';
import { and, eq, inArray } from 'drizzle-orm';

import * as HttpStatusCodes from 'stoker/http-status-codes';
import { z } from 'zod';

function getTableColumn<T extends Table>(table: T, columnName: string): any {
  return (table as Record<string, any>)[columnName];
}

export interface StatusTransition {
  from: string[];
  to: string;
}

export interface StatusTransitions {
  [action: string]: StatusTransition;
}

export interface StatusHandlerOptions<T extends Table> {
  statusField: string;
  transitions: StatusTransitions;
  table: T;
  bulkLimit?: number;
  updatedAtField?: string;
}

export interface StatusHandlers {
  [action: string]: (c: any) => Promise<any>;
}

export interface BulkStatusResponse {
  updated: number;
  skipped: number;
}

function createBulkInputSchema(limit: number) {
  return z.object({
    ids: z.array(z.string()).min(1).max(limit),
  });
}

export function createStatusHandlers<TTable extends Table>(
  options: StatusHandlerOptions<TTable>,
): StatusHandlers {
  const {
    table,
    statusField,
    transitions,
    bulkLimit = 500,
    updatedAtField = 'updatedAt',
  } = options;

  const statusColumn = getTableColumn(table, statusField);
  const bulkSchema = createBulkInputSchema(bulkLimit);

  const handlers: StatusHandlers = {};

  for (const [action, transition] of Object.entries(transitions)) {
    const { from, to } = transition;

    handlers[action] = async (c: any) => {
      const db = c.get('db');
      const { id } = c.req.valid('param');

      try {
        const whereCondition = and(
          eq(getTableColumn(table, 'id'), id),
          inArray(statusColumn, from),
        );

        const updateData: any = { [statusField]: to };

        if (updatedAtField) {
          updateData[updatedAtField] = new Date();
        }

        const [updatedItem] = await db.update(table).set(updateData).where(whereCondition).returning();

        if (!updatedItem) {
          return c.json({ error: 'Item not found or invalid transition' }, HttpStatusCodes.NOT_FOUND);
        }

        return c.json(updatedItem, HttpStatusCodes.OK);
      }
      catch (error) {
        return c.json(
          { error: 'Failed to update status', details: error instanceof Error ? error.message : 'Unknown error' },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    };

    handlers[`bulk-${action}`] = async (c: any) => {
      const db = c.get('db');

      try {
        const input = bulkSchema.parse(c.req.valid('json'));
        const whereCondition = and(
          inArray(getTableColumn(table, 'id'), input.ids),
          inArray(statusColumn, from),
        );

        const updateData: any = { [statusField]: to };

        if (updatedAtField) {
          updateData[updatedAtField] = new Date();
        }

        const result = await db.update(table).set(updateData).where(whereCondition).returning();

        const updated = result.length;
        const skipped = input.ids.length - updated;

        return c.json(
          {
            updated,
            skipped,
          } satisfies BulkStatusResponse,
          HttpStatusCodes.OK,
        );
      }
      catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
          return c.json(
            { error: 'Invalid input', details: error.message },
            HttpStatusCodes.BAD_REQUEST,
          );
        }
        return c.json(
          { error: 'Failed to bulk update status', details: error instanceof Error ? error.message : 'Unknown error' },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
    };
  }

  return handlers;
}

export { createBulkInputSchema };
