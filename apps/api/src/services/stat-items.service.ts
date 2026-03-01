import type { SupportedLanguage } from '@playgrid/shared/types';
import type { Context } from 'hono';

import type { AppEnv } from '@/lib/types';
import { and, eq, inArray, isNull, not, sql } from 'drizzle-orm';
import { getDB } from '@/db';
import { statItemsTable } from '@/db/schema';
import { TranslationService } from '@/lib/services/translation-service';

interface StatItem {
  id: string;
  name: string;
  nameAr: string | null;
  imageUrl: string | null;
  hint: string | null;
  hintAr: string | null;
  unit: string | null;
  unitAr: string | null;
}

export interface FetchStatItemsOptions {
  category?: string;
  metricType?: string;
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  excludeIds?: string[];
  lang?: SupportedLanguage;
}

export async function fetchStatItems(
  c: Context<AppEnv>,
  options: FetchStatItemsOptions,
): Promise<StatItem[]> {
  const db = getDB(c);
  const {
    category,
    metricType,
    status = 'approved',
    limit = 20,
    excludeIds = [],
    lang = 'en',
  } = options;

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
      name: statItemsTable.name,
      nameAr: statItemsTable.nameAr,
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
    return items;
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

  return items;
}
