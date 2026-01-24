import { createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import z from 'zod';
import { publicBannerSchema } from './banners.schemas';

const tags = ['Banners'];

export const listActiveBanners = createRoute({
  path: '/',
  method: 'get',
  operationId: 'listActiveBanners',
  tags,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      z.array(publicBannerSchema),
      'List of active banners ordered by position',
    ),
  },
});

export type ListActiveBannersRoute = typeof listActiveBanners;
