import type {
  CreateCompanyRoute,
  DeleteCompanyRoute,
  GetCompanyByIdRoute,
  ListCompaniesRoute,
  SyncCompanyLogoRoute,
  UpdateCompanyRoute,
} from './companies.routes';
import type { AppRouteHandler } from '@/lib/types';
import { LogoDevClient } from '@playgrid/data-pipeline/sources';
import { and, asc, count, desc, eq, isNull } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { z } from 'zod';
import { getDB } from '@/db';
import { companiesTable, statItemsTable } from '@/db/schema';
import { logger } from '@/utils/logger';

function getLogoClient(c: { env: { LOGO_DEV_API_KEY?: string } }) {
  return new LogoDevClient({
    baseUrl: 'https://api.logo.dev',
    apiKey: c.env.LOGO_DEV_API_KEY,
  });
}

async function upsertCompanyStatItem(
  db: ReturnType<typeof getDB>,
  company: { id: string; nameEn: string; nameAr: string | null; listId: string },
  logoUrl: string | null,
) {
  if (!logoUrl) {
    logger.info({ nameEn: company.nameEn }, 'No logo URL to upsert');
    return;
  }

  const existing = await db
    .select()
    .from(statItemsTable)
    .where(
      and(
        eq(statItemsTable.entity, 'company'),
        eq(statItemsTable.externalId, company.id),
        eq(statItemsTable.category, company.listId),
        eq(statItemsTable.metricType, 'brand'),
      ),
    )
    .limit(1);

  const values = {
    entity: 'company',
    externalId: company.id,
    category: company.listId,
    name: company.nameEn,
    nameAr: company.nameAr,
    metricType: 'brand',
    value: 1,
    unit: 'company',
    unitAr: 'شركة',
    imageUrl: logoUrl,
    hint: company.nameEn,
    hintAr: company.nameAr,
    source: 'logo-dev',
    status: 'approved',
  };

  if (existing.length > 0) {
    await db.update(statItemsTable)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(statItemsTable.id, existing[0].id));
  }
  else {
    await db.insert(statItemsTable).values(values);
  }
}

function cascadeStatItems(
  db: ReturnType<typeof getDB>,
  company: { id: string; listId: string },
) {
  return db
    .select()
    .from(statItemsTable)
    .where(
      and(
        eq(statItemsTable.entity, 'company'),
        eq(statItemsTable.category, company.listId),
        eq(statItemsTable.externalId, company.id),
        isNull(statItemsTable.deletedAt),
      ),
    );
}

export const listCompaniesHandler: AppRouteHandler<ListCompaniesRoute> = async (c) => {
  const db = getDB(c);
  const { page, limit, listId, isActive, sort, order } = c.req.valid('query');

  const offset = (page - 1) * limit;
  const whereConditions = [eq(companiesTable.isActive, isActive ?? true)];

  if (listId) {
    whereConditions.push(eq(companiesTable.listId, listId));
  }

  const orderBy = order === 'DESC'
    ? desc(sort === 'nameEn' ? companiesTable.nameEn : companiesTable.createdAt)
    : asc(sort === 'nameEn' ? companiesTable.nameEn : companiesTable.createdAt);

  const [data, [{ total }]] = await Promise.all([
    db.select().from(companiesTable).where(and(...whereConditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ total: count() }).from(companiesTable).where(and(...whereConditions)),
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

export const getCompanyByIdHandler: AppRouteHandler<GetCompanyByIdRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, id))
    .limit(1);

  if (!company) {
    return c.json({ error: 'Company not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(company, HttpStatusCodes.OK);
};

export const createCompanyHandler: AppRouteHandler<CreateCompanyRoute> = async (c) => {
  const db = getDB(c);

  try {
    const { nameEn, nameAr, listId, sync } = c.req.valid('json');

    const [company] = await db.insert(companiesTable).values({
      nameEn,
      nameAr: nameAr ?? null,
      listId,
    }).returning();

    if (sync) {
      try {
        const client = getLogoClient(c);
        const logoUrl = await client.getLogoUrl(nameEn);
        await upsertCompanyStatItem(db, company, logoUrl);

        await db.update(companiesTable)
          .set({ lastSyncedAt: new Date() })
          .where(eq(companiesTable.id, company.id));
      }
      catch (error) {
        logger.error({ nameEn, error }, 'Failed to sync logo on company create');
      }
    }

    return c.json(company, HttpStatusCodes.CREATED);
  }
  catch (error) {
    logger.error('Failed to create company:', error);

    if (error instanceof z.ZodError) {
      return c.json(
        { error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create company' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

export const updateCompanyHandler: AppRouteHandler<UpdateCompanyRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  try {
    const [existing] = await db
      .select()
      .from(companiesTable)
      .where(eq(companiesTable.id, id))
      .limit(1);

    if (!existing) {
      return c.json({ error: 'Company not found' }, HttpStatusCodes.NOT_FOUND);
    }

    const input = c.req.valid('json');

    const [company] = await db.update(companiesTable)
      .set({
        ...input,
        nameAr: input.nameAr !== undefined ? input.nameAr : undefined,
        updatedAt: new Date(),
      })
      .where(eq(companiesTable.id, id))
      .returning();

    const linkedStatItems = await cascadeStatItems(db, company);
    const nameChanged = input.nameEn && input.nameEn !== existing.nameEn;
    const listIdChanged = input.listId && input.listId !== existing.listId;

    if (nameChanged || listIdChanged) {
      for (const item of linkedStatItems) {
        await db.update(statItemsTable)
          .set({
            name: input.nameEn ?? item.name,
            nameAr: input.nameAr !== undefined ? (input.nameAr ?? item.nameAr) : item.nameAr,
            category: input.listId ?? item.category,
            updatedAt: new Date(),
          })
          .where(eq(statItemsTable.id, item.id));
      }
    }

    return c.json(company, HttpStatusCodes.OK);
  }
  catch (error) {
    if (error instanceof z.ZodError) {
      return c.json(
        { error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to update company' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

export const deleteCompanyHandler: AppRouteHandler<DeleteCompanyRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const [existing] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, id))
    .limit(1);

  if (!existing) {
    return c.json({ error: 'Company not found' }, HttpStatusCodes.NOT_FOUND);
  }

  const now = new Date();

  await db.update(companiesTable)
    .set({ isActive: false, updatedAt: now })
    .where(eq(companiesTable.id, id));

  const linkedStatItems = await cascadeStatItems(db, existing);
  for (const item of linkedStatItems) {
    await db.update(statItemsTable)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(statItemsTable.id, item.id));
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};

export const syncCompanyLogoHandler: AppRouteHandler<SyncCompanyLogoRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const [company] = await db
    .select()
    .from(companiesTable)
    .where(eq(companiesTable.id, id))
    .limit(1);

  if (!company) {
    return c.json({ error: 'Company not found' }, HttpStatusCodes.NOT_FOUND);
  }

  try {
    const client = getLogoClient(c);
    const logoUrl = await client.getLogoUrl(company.nameEn);

    await upsertCompanyStatItem(db, company, logoUrl);

    await db.update(companiesTable)
      .set({ lastSyncedAt: new Date(), updatedAt: new Date() })
      .where(eq(companiesTable.id, company.id));

    return c.json({
      synced: true,
      logoUrl,
    }, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error({ nameEn: company.nameEn, error }, 'Failed to sync company logo');

    return c.json(
      { error: error instanceof Error ? error.message : 'Sync failed' },
      HttpStatusCodes.INTERNAL_SERVER_ERROR,
    );
  }
};
