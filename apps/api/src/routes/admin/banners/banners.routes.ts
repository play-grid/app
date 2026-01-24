import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import {
  bannerOutputSchema,
  createBannerFormSchema,
  listBannersQuerySchema,
  listBannersResponseSchema,
  updateBannerFormSchema,
} from './banners.schemas';

const tags = ['Banners'];

export const listBanners = createRoute({
  path: '/',
  method: 'get',
  operationId: 'listAdminBanners',
  tags,
  request: {
    query: listBannersQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      listBannersResponseSchema,
      'List of banners with pagination',
    ),
  },
});

export type ListBannersRoute = typeof listBanners;

export const getBannerById = createRoute({
  path: '/:id',
  method: 'get',
  operationId: 'getAdminBannerById',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(bannerOutputSchema, 'Banner details'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Banner not found',
    ),
  },
});

export type GetBannerByIdRoute = typeof getBannerById;

export const createBanner = createRoute({
  path: '/',
  method: 'post',
  operationId: 'createAdminBanner',
  tags,
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: createBannerFormSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      bannerOutputSchema,
      'Banner created successfully',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid input or upload failed',
    ),
  },
});

export type CreateBannerRoute = typeof createBanner;

export const updateBanner = createRoute({
  path: '/:id',
  method: 'patch',
  operationId: 'updateAdminBanner',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'multipart/form-data': {
          schema: updateBannerFormSchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      bannerOutputSchema,
      'Banner updated successfully',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Banner not found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid input or upload failed',
    ),
  },
});

export type UpdateBannerRoute = typeof updateBanner;

export const deleteBanner = createRoute({
  path: '/:id',
  method: 'delete',
  operationId: 'deleteAdminBanner',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Banner deleted successfully',
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Banner not found',
    ),
  },
});

export type DeleteBannerRoute = typeof deleteBanner;
