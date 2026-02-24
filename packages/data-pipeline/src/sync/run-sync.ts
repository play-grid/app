import type { Table } from 'drizzle-orm';
import type { DrizzleD1Database } from 'drizzle-orm/d1';

import type { StatItemInput, StatItemTransformer, SyncResult } from '../types';
import { and, eq } from 'drizzle-orm';

export type DB = any;

export interface SyncOptions<TTable extends Table> {
  table: TTable;
  externalIdField?: keyof TTable['_']['columns'];
  categoryField?: keyof TTable['_']['columns'];
  metricTypeField?: keyof TTable['_']['columns'];
  manualOverrideField?: keyof TTable['_']['columns'];
}

export async function runSync<TRaw, TTable extends Table>(
  transformer: StatItemTransformer<TRaw>,
  db: DB,
  options: SyncOptions<TTable>,
): Promise<SyncResult> {
  const startTime = Date.now();
  const rawItems = await transformer.fetch();

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  const table = options.table;

  for (const raw of rawItems) {
    let inputs: StatItemInput[];

    try {
      inputs = transformer.transform(raw);
    }
    catch (err) {
      errors++;
      console.error(`Transform failed for item in ${transformer.category}:`, err);
      continue;
    }

    for (const input of inputs) {
      const result = await upsertStatItem(input, db, table, options);
      if (result === 'inserted')
        inserted++;
      else if (result === 'updated')
        updated++;
      else if (result === 'skipped')
        skipped++;
      else errors++;
    }
  }

  return {
    inserted,
    updated,
    skipped,
    errors,
    duration: Date.now() - startTime,
  };
}

type UpsertResult = 'inserted' | 'updated' | 'skipped' | 'error';

async function upsertStatItem<TTable extends Table>(
  input: StatItemInput,
  db: DB,
  table: TTable,
  options: SyncOptions<TTable>,
): Promise<UpsertResult> {
  const externalIdField = (options.externalIdField || 'externalId') as string;
  const categoryField = (options.categoryField || 'category') as string;
  const metricTypeField = (options.metricTypeField || 'metricType') as string;
  const manualOverrideField = (options.manualOverrideField || 'isManualOverride') as string;

  const getTableColumn = (name: string): any => (table as Record<string, any>)[name];

  const dbValues = {
    entity: input.entity,
    externalId: input.externalId,
    category: input.category,
    name: input.name,
    metricType: input.metricType,
    value: input.value,
    unit: input.unit,
    imageKey: input.imageKey,
    imageUrl: input.imageUrl,
    hint: input.hint,
    source: input.source,
    status: input.status || 'pending',
  };

  if (!input.externalId) {
    await db.insert(table).values(dbValues as any);
    return 'inserted';
  }

  const existing = await db.select()
    .from(table)
    .where(and(
      eq(getTableColumn(externalIdField), input.externalId),
      eq(getTableColumn(categoryField), input.category),
      eq(getTableColumn(metricTypeField), input.metricType),
    ))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(table).values(dbValues as any);
    return 'inserted';
  }

  if (existing[0]?.[manualOverrideField]) {
    return 'skipped';
  }

  await db.update(table)
    .set({
      entity: input.entity,
      value: input.value,
      unit: input.unit,
      imageUrl: input.imageUrl,
      hint: input.hint,
      lastSyncedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(getTableColumn('id'), existing[0].id));

  return 'updated';
}
