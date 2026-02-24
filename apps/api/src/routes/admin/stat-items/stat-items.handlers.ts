import type { InferInsertModel } from 'drizzle-orm';
import type {
  BulkUpdateStatusRoute,
  CreateStatItemRoute,
  DeleteStatItemRoute,
  GetStatItemByIdRoute,
  ListStatItemsRoute,
  UpdateStatItemRoute,
  UpdateStatItemStatusRoute,
} from './stat-items.routes';
import type { AppRouteHandler } from '@/lib/types';
import { and, asc, count, desc, eq, inArray, isNull } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { z } from 'zod';
import { getDB } from '@/db';
import { statItemsTable } from '@/db/schema';

export const listStatItemsHandler: AppRouteHandler<ListStatItemsRoute> = async (c) => {
  const db = getDB(c);
  const { page, limit, status, category, metricType, entity, source, sort, order } = c.req.valid('query');

  const offset = (page - 1) * limit;
  const whereConditions: any[] = [];

  if (status) {
    whereConditions.push(eq(statItemsTable.status, status));
  }
  if (category) {
    whereConditions.push(eq(statItemsTable.category, category));
  }
  if (metricType) {
    whereConditions.push(eq(statItemsTable.metricType, metricType));
  }
  if (entity) {
    whereConditions.push(eq(statItemsTable.entity, entity));
  }
  if (source) {
    whereConditions.push(eq(statItemsTable.source, source));
  }

  whereConditions.push(isNull(statItemsTable.deletedAt));

  let orderBy;
  if (sort === 'value') {
    orderBy = order === 'DESC' ? desc(statItemsTable.value) : asc(statItemsTable.value);
  }
  else if (sort === 'name') {
    orderBy = order === 'DESC' ? desc(statItemsTable.name) : asc(statItemsTable.name);
  }
  else {
    orderBy = order === 'DESC' ? desc(statItemsTable.createdAt) : asc(statItemsTable.createdAt);
  }

  const [data, [{ total }]] = await Promise.all([
    db.select().from(statItemsTable).where(and(...whereConditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ total: count() }).from(statItemsTable).where(and(...whereConditions)),
  ]);

  return c.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getStatItemByIdHandler: AppRouteHandler<GetStatItemByIdRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const [item] = await db.select().from(statItemsTable).where(eq(statItemsTable.id, id)).limit(1);

  if (!item) {
    return c.json({ error: 'Stat item not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(item, HttpStatusCodes.OK);
};

export const createStatItemHandler: AppRouteHandler<CreateStatItemRoute> = async (c) => {
  const db = getDB(c);

  try {
    const input = c.req.valid('json');
    const now = new Date();

    const [result] = await db
      .insert(statItemsTable)
      .values({
        ...input,
        status: input.status || 'approved',
        isManualOverride: true,
        createdAt: now,
        updatedAt: now,
      } as InferInsertModel<typeof statItemsTable>)
      .returning();

    return c.json(result, HttpStatusCodes.CREATED);
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create stat item' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

export const updateStatItemHandler: AppRouteHandler<UpdateStatItemRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  try {
    const input = c.req.valid('json');

    const [result] = await db
      .update(statItemsTable)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(statItemsTable.id, id))
      .returning();

    if (!result) {
      return c.json({ error: 'Stat item not found' }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(result, HttpStatusCodes.OK);
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to update stat item' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

export const deleteStatItemHandler: AppRouteHandler<DeleteStatItemRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const [result] = await db
    .update(statItemsTable)
    .set({ deletedAt: new Date() })
    .where(eq(statItemsTable.id, id))
    .returning();

  if (!result) {
    return c.json({ error: 'Stat item not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const updateStatItemStatusHandler: AppRouteHandler<UpdateStatItemStatusRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');
  const { status } = c.req.valid('json');

  const [result] = await db
    .update(statItemsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(statItemsTable.id, id))
    .returning();

  if (!result) {
    return c.json({ error: 'Stat item not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(result, HttpStatusCodes.OK);
};

export const bulkUpdateStatusHandler: AppRouteHandler<BulkUpdateStatusRoute> = async (c) => {
  const db = getDB(c);
  const { ids, status } = c.req.valid('json');

  try {
    const result = await db
      .update(statItemsTable)
      .set({ status, updatedAt: new Date() })
      .where(and(inArray(statItemsTable.id, ids), isNull(statItemsTable.deletedAt)))
      .returning();

    return c.json({ updated: result.length }, HttpStatusCodes.OK);
  }
  catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to bulk update status' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};
