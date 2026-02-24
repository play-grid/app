import type { GetStatItemsRoute } from './stat-items.routes';
import type { AppRouteHandler } from '@/lib/types';
import { and, eq, inArray, isNull, not, sql } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import { getDB } from '@/db';
import { statItemsTable } from '@/db/schema';
import { TranslationService } from '@/lib/services/translation-service';

export const getStatItemsHandler: AppRouteHandler<GetStatItemsRoute> = async (c) => {
  const db = getDB(c);
  const { category, metricType, status, limit, excludeIds = [], lang = 'en' } = c.req.valid('query');

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
      nameAr: statItemsTable.nameAr,
      metricType: statItemsTable.metricType,
      value: statItemsTable.value,
      unit: statItemsTable.unit,
      unitAr: statItemsTable.unitAr,
      imageUrl: statItemsTable.imageUrl,
      hint: statItemsTable.hint,
      hintAr: statItemsTable.hintAr,
    })
    .from(statItemsTable)
    .where(whereClause)
    .orderBy(sql`RANDOM()`)
    .limit(limit);

  if (lang === 'en') {
    return c.json({ items: items.map(toEnResponse) }, HttpStatusCodes.OK);
  }

  const needsTranslation = items.filter(i => !i.nameAr);

  if (needsTranslation.length > 0) {
    const translationService = new TranslationService(c.env.AI);
    const translated = await translationService.translateStatItemFields(
      needsTranslation.map(i => ({ name: i.name, unit: i.unit, hint: i.hint })),
      'ar',
    );

    await Promise.all(
      translated.map((t, index) =>
        db
          .update(statItemsTable)
          .set({
            nameAr: t.nameAr || null,
            unitAr: t.unitAr || null,
            hintAr: t.hintAr || null,
          })
          .where(eq(statItemsTable.id, needsTranslation[index].id)),
      ),
    );

    items.forEach((item) => {
      const translationIndex = needsTranslation.findIndex(t => t.id === item.id);
      if (translationIndex !== -1) {
        item.nameAr = translated[translationIndex].nameAr || item.nameAr;
        item.unitAr = translated[translationIndex].unitAr || item.unitAr;
        item.hintAr = translated[translationIndex].hintAr || item.hintAr;
      }
    });
  }

  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');

  return c.json({ items: items.map(toArResponse) }, HttpStatusCodes.OK);
};

function toEnResponse(item: {
  id: string;
  entity: string;
  name: string;
  metricType: string;
  value: number;
  unit: string;
  imageUrl: string | null;
  hint: string | null;
}) {
  return {
    id: item.id,
    entity: item.entity,
    name: item.name,
    metricType: item.metricType,
    value: item.value,
    unit: item.unit,
    imageUrl: item.imageUrl,
    hint: item.hint,
  };
}

function toArResponse(item: {
  id: string;
  entity: string;
  name: string;
  nameAr: string | null;
  metricType: string;
  value: number;
  unit: string;
  unitAr: string | null;
  imageUrl: string | null;
  hint: string | null;
  hintAr: string | null;
}) {
  return {
    id: item.id,
    entity: item.entity,
    name: item.nameAr || item.name,
    metricType: item.metricType,
    value: item.value,
    unit: item.unitAr || item.unit,
    imageUrl: item.imageUrl,
    hint: item.hintAr || item.hint,
  };
}
