import type { InferInsertModel } from 'drizzle-orm';
import type {
  CreateBannerRoute,
  DeleteBannerRoute,
  GetBannerByIdRoute,
  ListBannersRoute,
  UpdateBannerRoute,
} from './banners.routes';
import type { AppRouteHandler } from '@/lib/types';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { z } from 'zod';
import { getDB } from '@/db';
import { banners } from '@/db/schema';
import { dataUrlToFile, uploadFile } from '@/lib/storage/upload';
import { logger } from '@/utils/logger';
import { createBannerFormSchema, updateBannerFormSchema } from './banners.schemas';

/**
 * Validates and uploads an image from either File or data URL
 */
async function handleImageUpload(
  imageFile: File | undefined,
  imageUrl: string | undefined,
  env: any,
): Promise<string | null> {
  logger.debug('handleImageUpload - input:', { imageFile, imageUrl });

  logger.debug('handleImageUpload - input:', { imageFile, imageUrl });

  if (imageFile) {
    const result = await uploadFile(imageFile, { category: 'banner' }, env);
    logger.debug('handleImageUpload - uploaded file url:', result.url);
    logger.debug('handleImageUpload - uploaded file url:', result.url);
    return result.url;
  }

  if (imageUrl?.startsWith('data:')) {
    const file = await dataUrlToFile(imageUrl, 'banner-image.jpg');
    const result = await uploadFile(file, { category: 'banner' }, env);
    logger.debug('handleImageUpload - dataUrl converted and uploaded url:', result.url);
    logger.debug('handleImageUpload - dataUrl converted and uploaded url:', result.url);
    return result.url;
  }

  logger.debug('handleImageUpload - returning original imageUrl:', imageUrl);
  logger.debug('handleImageUpload - returning original imageUrl:', imageUrl);
  return imageUrl || null;
}

/**
 * Helper to safely parse FormData into typed object with Zod validation
 */
function parseFormData(formData: FormData, isUpdate = false) {
  logger.debug('parseFormData - raw formData entries:', Array.from(formData.entries()));

  const raw: any = {};

  // Helper to extract string fields
  const getString = (key: string) => {
    const val = formData.get(key);
    if (val === null)
      return undefined;
    const s = val as string;
    return s === '' || s === 'null' ? null : s;
  };

  const stringFields = ['titleEn', 'titleAr', 'descriptionEn', 'descriptionAr', 'imageUrl', 'linkUrl', 'startDate', 'endDate'];
  for (const field of stringFields) {
    if (formData.has(field)) {
      raw[field] = getString(field);
    }
  }

  if (formData.has('isActive')) {
    raw.isActive = formData.get('isActive') === 'true' || formData.get('isActive') === '1';
  }

  if (formData.has('position')) {
    const pos = formData.get('position');
    raw.position = pos !== null ? Number.parseInt(pos as string) : undefined;
  }

  if (formData.has('imageFile')) {
    const file = formData.get('imageFile');
    if (file && typeof file !== 'string') {
      raw.imageFile = file as File;
    }
  }

  logger.debug('parseFormData - raw object before Zod:', raw);

  // Validate with Zod
  const schema = isUpdate ? updateBannerFormSchema : createBannerFormSchema;
  const parsed = schema.parse(raw);
  logger.debug('parseFormData - parsed object after Zod:', parsed);
  return parsed;
}

export const listBannersHandler: AppRouteHandler<ListBannersRoute> = async (c) => {
  const db = getDB(c);
  const { page, limit, isActive, sort, order } = c.req.valid('query');

  const offset = (page - 1) * limit;
  const whereConditions = [];

  if (isActive !== undefined) {
    whereConditions.push(eq(banners.isActive, isActive));
  }

  const orderBy = order === 'DESC'
    ? desc(sort === 'position' ? banners.position : banners.createdAt)
    : asc(sort === 'position' ? banners.position : banners.createdAt);

  const [data, [{ total }]] = await Promise.all([
    db.select().from(banners).where(and(...whereConditions)).orderBy(orderBy).limit(limit).offset(offset),
    db.select({ total: count() }).from(banners).where(and(...whereConditions)),
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

export const getBannerByIdHandler: AppRouteHandler<GetBannerByIdRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const [banner] = await db.select().from(banners).where(eq(banners.id, id)).limit(1);

  if (!banner) {
    return c.json({ error: 'Banner not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.json(banner, HttpStatusCodes.OK);
};

export const createBannerHandler: AppRouteHandler<CreateBannerRoute> = async (c) => {
  const db = getDB(c);

  try {
    const formData = await c.req.formData();
    logger.debug('createBannerHandler - received formData:', Array.from(formData.entries()));
    logger.debug('createBannerHandler - received formData:', Array.from(formData.entries()));
    const input = parseFormData(formData, false);

    const imageUrl = await handleImageUpload(input.imageFile, input.imageUrl, c.env);

    const now = new Date();
    const [result] = await db
      .insert(banners)
      .values({
        titleEn: input.titleEn,
        titleAr: input.titleAr,
        descriptionEn: input.descriptionEn,
        descriptionAr: input.descriptionAr,
        imageUrl,
        linkUrl: input.linkUrl,
        isActive: input.isActive,
        position: input.position,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        createdAt: now,
        updatedAt: now,
      } as InferInsertModel<typeof banners>)
      .returning();

    return c.json(result, HttpStatusCodes.CREATED);
  }
  catch (error) {
    logger.error('Failed to create banner:', error);
    logger.error('Failed to create banner:', error);

    // Zod validation errors
    if (error instanceof z.ZodError) {
      return c.json(
        { error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to create banner' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

export const updateBannerHandler: AppRouteHandler<UpdateBannerRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  try {
    const formData = await c.req.formData();
    const input = parseFormData(formData, true);

    // Handle image upload if provided
    const imageUrl = (input.imageFile || input.imageUrl)
      ? await handleImageUpload(input.imageFile, input.imageUrl, c.env)
      : undefined;

    // Build update object only with provided fields
    const updateData: any = { updatedAt: new Date() };

    if (input.titleEn !== undefined)
      updateData.titleEn = input.titleEn;
    if (input.titleAr !== undefined)
      updateData.titleAr = input.titleAr;
    if (input.descriptionEn !== undefined)
      updateData.descriptionEn = input.descriptionEn;
    if (input.descriptionAr !== undefined)
      updateData.descriptionAr = input.descriptionAr;
    if (input.linkUrl !== undefined)
      updateData.linkUrl = input.linkUrl;
    if (input.isActive !== undefined)
      updateData.isActive = input.isActive;
    if (input.position !== undefined)
      updateData.position = input.position;
    if (input.startDate !== undefined)
      updateData.startDate = input.startDate ? new Date(input.startDate) : null;
    if (input.endDate !== undefined)
      updateData.endDate = input.endDate ? new Date(input.endDate) : null;
    if (imageUrl !== undefined)
      updateData.imageUrl = imageUrl;

    const [result] = await db.update(banners).set(updateData).where(eq(banners.id, id)).returning();

    if (!result) {
      return c.json({ error: 'Banner not found' }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(result, HttpStatusCodes.OK);
  }
  catch (error) {
    logger.error('Failed to update banner:', error);
    logger.error('Failed to update banner:', error);

    if (error instanceof z.ZodError) {
      return c.json(
        { error: error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    return c.json(
      { error: error instanceof Error ? error.message : 'Failed to update banner' },
      HttpStatusCodes.BAD_REQUEST,
    );
  }
};

export const deleteBannerHandler: AppRouteHandler<DeleteBannerRoute> = async (c) => {
  const db = getDB(c);
  const { id } = c.req.valid('param');

  const [result] = await db.delete(banners).where(eq(banners.id, id)).returning();

  if (!result) {
    return c.json({ error: 'Banner not found' }, HttpStatusCodes.NOT_FOUND);
  }

  return c.body(null, HttpStatusCodes.NO_CONTENT);
};
