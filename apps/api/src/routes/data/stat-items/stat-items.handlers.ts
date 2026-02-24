import type { GetStatItemsRoute } from './stat-items.routes';
import type { AppRouteHandler } from '@/lib/types';
import { and, eq, inArray, isNull, not, sql } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { getDB } from '@/db';
import { statItemsTable } from '@/db/schema';

export const getStatItemsHandler: AppRouteHandler<GetStatItemsRoute> = async (c) => {
  const db = getDB(c);
  const { category, metricType, status, limit, excludeIds = [] } = c.req.valid('query');

  const filters: any[] = [];

  if (category) {
    filters.push(eq(statItemsTable.category, category));
  }

  if (metricType) {
    filters.push(eq(statItemsTable.metricType, metricType));
  }

  filters.push(eq(statItemsTable.status, status));
  filters.push(isNull(statItemsTable.deletedAt));

  if (excludeIds.length > 0) {
    filters.push(not(inArray(statItemsTable.id, excludeIds)));
  }

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  const items = await db
    .select({
      id: statItemsTable.id,
      entity: statItemsTable.entity,
      name: statItemsTable.name,
      metricType: statItemsTable.metricType,
      value: statItemsTable.value,
      unit: statItemsTable.unit,
      imageUrl: statItemsTable.imageUrl,
      hint: statItemsTable.hint,
    })
    .from(statItemsTable)
    .where(whereClause)
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');

  return c.json({ items }, HttpStatusCodes.OK);
};
