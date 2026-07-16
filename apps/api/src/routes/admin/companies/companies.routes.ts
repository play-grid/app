import { createRoute, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { jsonContent } from 'stoker/openapi/helpers';
import {
  companyOutputSchema,
  createCompanySchema,
  listCompaniesQuerySchema,
  listCompaniesResponseSchema,
  syncCompanyResultSchema,
  updateCompanySchema,
} from './companies.schemas';

const tags = ['Companies'];

export const listCompanies = createRoute({
  path: '/',
  method: 'get',
  operationId: 'listAdminCompanies',
  tags,
  request: {
    query: listCompaniesQuerySchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      listCompaniesResponseSchema,
      'List of companies with pagination',
    ),
  },
});

export type ListCompaniesRoute = typeof listCompanies;

export const getCompanyById = createRoute({
  path: '/:id',
  method: 'get',
  operationId: 'getAdminCompanyById',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(companyOutputSchema, 'Company details'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Company not found',
    ),
  },
});

export type GetCompanyByIdRoute = typeof getCompanyById;

export const createCompany = createRoute({
  path: '/',
  method: 'post',
  operationId: 'createAdminCompany',
  tags,
  request: {
    body: {
      content: {
        'application/json': {
          schema: createCompanySchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      companyOutputSchema,
      'Company created successfully',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid input',
    ),
  },
});

export type CreateCompanyRoute = typeof createCompany;

export const updateCompany = createRoute({
  path: '/:id',
  method: 'patch',
  operationId: 'updateAdminCompany',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
    body: {
      content: {
        'application/json': {
          schema: updateCompanySchema,
        },
      },
    },
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      companyOutputSchema,
      'Company updated successfully',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Company not found',
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({ error: z.string() }),
      'Invalid input',
    ),
  },
});

export type UpdateCompanyRoute = typeof updateCompany;

export const deleteCompany = createRoute({
  path: '/:id',
  method: 'delete',
  operationId: 'deleteAdminCompany',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.NO_CONTENT]: {
      description: 'Company deleted successfully',
    },
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Company not found',
    ),
  },
});

export type DeleteCompanyRoute = typeof deleteCompany;

export const syncCompanyLogo = createRoute({
  path: '/:id/sync',
  method: 'post',
  operationId: 'syncAdminCompanyLogo',
  tags,
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      syncCompanyResultSchema,
      'Company logo synced',
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      z.object({ error: z.string() }),
      'Company not found',
    ),
    [HttpStatusCodes.INTERNAL_SERVER_ERROR]: jsonContent(
      z.object({ error: z.string() }),
      'Sync failed',
    ),
  },
});

export type SyncCompanyLogoRoute = typeof syncCompanyLogo;
