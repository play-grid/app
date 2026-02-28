import type { DataProvider } from 'ra-core';
import { hcWithType } from '@guess-logo/api-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const client = hcWithType(API_URL);

type ResourceType = 'questions' | 'question-feedback' | 'categories' | 'banners';

const routeMap: Record<
  ResourceType,
  Partial<{
    getList: () => any;
    getOne: () => any;
    create: () => any;
    update: () => any;
    delete: () => any;
  }>
> = {
  'questions': {
    getList: () => client.api.admin.questions.$get,
    getOne: () => client.api.admin.questions[':id'].$get,
    create: () => client.api.admin.questions.$post,
    update: () => client.api.admin.questions[':id'].$patch,
    delete: () => client.api.admin.questions[':id'].$delete,
  },
  'question-feedback': {
    getList: () => (client.api.admin)['question-feedback'].$get,
  },
  'banners': {
    getList: () => client.api.admin.banners.$get,
    getOne: () => (client.api.admin).banners[':id'].$get,
    create: () => (client.api.admin).banners.$post,
    update: () => (client.api.admin).banners[':id'].$patch,
    delete: () => (client.api.admin).banners[':id'].$delete,
  },
  'categories': {
    getList: () => (client.api.admin).categories.$get,
    getOne: () => (client.api.admin).categories[':id'].$get,
  },
};

async function getListHandler(
  resource: ResourceType,
  params: {
    pagination?: { page: number; perPage: number };
    sort?: { field: string; order: 'ASC' | 'DESC' };
    filter?: Record<string, any>;
  },
) {
  const { page = 1, perPage = 20 } = params.pagination || {};
  const { filter = {}, sort } = params;

  try {
    const resourceConfig = routeMap[resource];
    if (!resourceConfig || !resourceConfig.getList) {
      throw new Error(`Resource "${resource}" does not support getList`);
    }

    const endpoint = resourceConfig.getList();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" getList endpoint not configured`);
    }

    const query: Record<string, string> = {
      page: page.toString(),
      limit: perPage.toString(),
      ...filter,

      _t: Date.now().toString(),
    };

    if (sort?.field && sort?.order) {
      query.sort = sort.field;
      query.order = sort.order;
    }

    const response = await endpoint({
      query,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch ${resource} list`,
      );
    }

    const data = await response.json();

    return {
      data: data.data || data[resource] || [],
      total: data.pagination?.total || data.total || 0,
    };
  }
  catch (error) {
    console.error(`Data provider error (getList ${resource}):`, error);
    throw error;
  }
}

async function getOneHandler(
  resource: ResourceType,
  params: { id: string | number },
) {
  try {
    const resourceConfig = routeMap[resource];
    if (!resourceConfig || !resourceConfig.getOne) {
      throw new Error(`Resource "${resource}" does not support getOne`);
    }

    const endpoint = resourceConfig.getOne();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" getOne endpoint not configured`);
    }

    const response = await endpoint({
      param: { id: params.id.toString() },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch ${resource} with id ${params.id}`,
      );
    }

    const data = await response.json();
    const recordData = data.data !== undefined ? data.data : data;

    return { data: recordData };
  }
  catch (error) {
    console.error(`Data provider error (getOne ${resource}):`, error);
    throw error;
  }
}

async function createHandler(
  resource: ResourceType,
  params: { data: Record<string, any> },
) {
  try {
    const resourceConfig = routeMap[resource];
    if (!resourceConfig || !resourceConfig.create) {
      throw new Error(`Resource "${resource}" does not support create`);
    }

    const endpoint = resourceConfig.create();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" create endpoint not configured`);
    }

    let response: Response;

    if (resource === 'banners') {
      // For banners, send as object to hc, which will handle FormData conversion
      const formPayload: Record<string, any> = {};
      Object.entries(params.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value.rawFile instanceof File) {
            // Handle file uploads
            formPayload[key] = value.rawFile;
          }
          else {
            formPayload[key] = value;
          }
        }
      });

      response = await endpoint({
        form: formPayload,
      });
    }
    else {
      response = await endpoint({
        json: params.data,
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create ${resource}`,
      );
    }

    const data = await response.json();
    const recordData = data.data !== undefined ? data.data : data;

    return { data: recordData };
  }
  catch (error) {
    console.error(`Data provider error (create ${resource}):`, error);
    throw error;
  }
}

async function updateHandler(
  resource: ResourceType,
  params: { id: string | number; data: Record<string, any>; previousData?: Record<string, any> },
) {
  try {
    const resourceConfig = routeMap[resource];
    if (!resourceConfig || !resourceConfig.update) {
      throw new Error(`Resource "${resource}" does not support update`);
    }

    const endpoint = resourceConfig.update();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" update endpoint not configured`);
    }

    let response: Response;

    if (resource === 'banners') {
      // For banners, send as object to hc, which will handle FormData conversion
      const formPayload: Record<string, any> = {};
      Object.entries(params.data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (value.rawFile instanceof File) {
            // Handle file uploads
            formPayload[key] = value.rawFile;
          }
          else {
            formPayload[key] = value;
          }
        }
      });

      response = await endpoint({
        param: { id: params.id.toString() },
        form: formPayload,
      });
    }
    else {
      response = await endpoint({
        param: { id: params.id.toString() },
        json: params.data,
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update ${resource}`,
      );
    }

    const data = await response.json();
    const recordData = data.data !== undefined ? data.data : data;

    return { data: recordData };
  }
  catch (error) {
    console.error(`Data provider error (update ${resource}):`, error);
    throw error;
  }
}

async function deleteHandler(
  resource: ResourceType,
  params: { id: string | number; previousData?: any },
) {
  try {
    const resourceConfig = routeMap[resource];
    if (!resourceConfig || !resourceConfig.delete) {
      throw new Error(`Resource "${resource}" does not support delete`);
    }

    const endpoint = resourceConfig.delete();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" delete endpoint not configured`);
    }

    const response = await endpoint({
      param: { id: params.id.toString() },
    });

    if (!response.ok) {
      const contentType = response.headers?.get?.('content-type');
      let errorData: any = {};

      if (contentType?.includes('application/json')) {
        errorData = await response.json().catch(() => ({}));
      }

      throw new Error(
        errorData.error || errorData.message || `Failed to delete ${resource}`,
      );
    }

    const contentType = response.headers?.get?.('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      const recordData = data.data !== undefined ? data.data : data;

      return { data: recordData };
    }

    return {
      data: params.previousData
        ? { ...params.previousData, deletedAt: new Date().toISOString() }
        : { id: params.id, deletedAt: new Date().toISOString() },
    };
  }
  catch (error) {
    console.error(`Data provider error (delete ${resource}):`, error);
    throw error;
  }
}

// STUB implementation
async function getManyHandler(
  resource: ResourceType,
  params: { ids: (string | number)[] },
) {
  const data = await Promise.all(
    params.ids.map(id => getOneHandler(resource, { id })),
  );
  return { data: data.map(d => d.data) };
}

async function getManyReferenceHandler(
  resource: ResourceType,
  params: {
    target: string;
    id: string | number;
    pagination?: { page: number; perPage: number };
    sort?: { field: string; order: 'ASC' | 'DESC' };
    filter?: Record<string, any>;
  },
) {
  return getListHandler(resource, {
    pagination: params.pagination,
    sort: params.sort,
    filter: { [params.target]: params.id, ...params.filter },
  });
}

async function updateManyHandler(
  resource: ResourceType,
  params: {
    ids: (string | number)[];
    data: Record<string, any>;
  },
) {
  const results = await Promise.all(
    params.ids.map(id =>
      updateHandler(resource, { id, data: params.data }),
    ),
  );
  return { data: results.map(r => r.data) };
}

async function deleteManyHandler(
  resource: ResourceType,
  params: { ids: (string | number)[]; previousData?: any[] },
) {
  const results = await Promise.all(
    params.ids.map((id, index) =>
      deleteHandler(resource, {
        id,
        previousData: params.previousData?.[index],
      }),
    ),
  );
  return { data: results.map(r => r.data) };
}

const dataProvider: DataProvider = {
  getList: (resource: string, params: any) =>
    getListHandler(resource as ResourceType, params),

  getOne: (resource: string, params: any) =>
    getOneHandler(resource as ResourceType, params),

  getMany: (resource: string, params: any) =>
    getManyHandler(resource as ResourceType, params),

  getManyReference: (resource: string, params: any) =>
    getManyReferenceHandler(resource as ResourceType, params),

  create: (resource: string, params: any) =>
    createHandler(resource as ResourceType, params),

  update: (resource: string, params: any) =>
    updateHandler(resource as ResourceType, params),

  updateMany: (resource: string, params: any) =>
    updateManyHandler(resource as ResourceType, params),

  delete: (resource: string, params: any) => {
    const deleteParams = params as any;
    return deleteHandler(resource as ResourceType, {
      id: deleteParams.id,
      previousData: deleteParams.previousData,
    });
  },

  deleteMany: (resource: string, params: any) => {
    const deleteParams = params as any;
    return deleteManyHandler(resource as ResourceType, {
      ids: deleteParams.ids,
      previousData: deleteParams.previousData,
    });
  },
} as DataProvider;

export default dataProvider;
