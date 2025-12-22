import { type DataProvider } from 'ra-core';
import { hcWithType } from '@guess-logo/api-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

const client = hcWithType(API_URL);

type ResourceType = 'questions';

const routeMap: Record<
  ResourceType,
  {
    getList: () => any;
    getOne: () => any;
    create: () => any;
    update: () => any;
    delete: () => any;
  }
> = {
  questions: {
    getList: () => client.api.admin.questions.$get,
    getOne: () => client.api.admin.questions[':id'].$get,
    create: () => client.api.admin.questions.$post,
    update: () => client.api.admin.questions[':id'].$patch,
    delete: () => client.api.admin.questions[':id'].$delete,
  },
};


async function getListHandler(
  resource: ResourceType,
  params: {
    pagination?: { page: number; perPage: number };
    sort?: { field: string; order: 'ASC' | 'DESC' };
    filter?: Record<string, any>;
  }
) {
  const { page = 1, perPage = 20 } = params.pagination || {};
  const { filter = {} } = params;

  try {
    const endpoint = routeMap[resource]?.getList();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" not supported`);
    }

    const response = await endpoint({
      query: {
        page: page.toString(),
        limit: perPage.toString(),
        ...filter,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch ${resource} list`
      );
    }

    const data = await response.json();

    return {
      data: data.data || data[resource] || [],
      total: data.pagination?.total || data.total || 0,
    };
  } catch (error) {
    console.error(`Data provider error (getList ${resource}):`, error);
    throw error;
  }
}

async function getOneHandler(
  resource: ResourceType,
  params: { id: string | number }
) {
  try {
    const endpoint = routeMap[resource]?.getOne();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" not supported`);
    }

    const response = await endpoint({
      param: { id: params.id.toString() },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch ${resource} with id ${params.id}`
      );
    }

    const data = await response.json();
    return { data: data.data || data };
  } catch (error) {
    console.error(`Data provider error (getOne ${resource}):`, error);
    throw error;
  }
}

async function createHandler(
  resource: ResourceType,
  params: { data: Record<string, any> }
) {
  try {
    const endpoint = routeMap[resource]?.create();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" not supported`);
    }

    const response = await endpoint({
      json: params.data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to create ${resource}`
      );
    }

    const data = await response.json();
    return { data: data.data || data };
  } catch (error) {
    console.error(`Data provider error (create ${resource}):`, error);
    throw error;
  }
}

async function updateHandler(
  resource: ResourceType,
  params: { id: string | number; data: Record<string, any>; previousData?: Record<string, any> }
) {
  try {
    const endpoint = routeMap[resource]?.update();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" not supported`);
    }

    const response = await endpoint({
      param: { id: params.id.toString() },
      json: params.data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to update ${resource}`
      );
    }

    const data = await response.json();
    return { data: data.data || data };
  } catch (error) {
    console.error(`Data provider error (update ${resource}):`, error);
    throw error;
  }
}

async function deleteHandler(
  resource: ResourceType,
  params: { id: string | number; previousData?: any }
) {
  try {
    const endpoint = routeMap[resource]?.delete();
    if (!endpoint) {
      throw new Error(`Resource "${resource}" not supported`);
    }

    const response = await endpoint({
      param: { id: params.id.toString() },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete ${resource}`
      );
    }



    return { 
      data: params.previousData || { id: params.id } 
    };
  } catch (error) {
    console.error(`Data provider error (delete ${resource}):`, error);
    throw error;
  }
}




// STUB implementation 
async function getManyHandler(
  resource: ResourceType,
  params: { ids: (string | number)[] }
) {
  
  
  const data = await Promise.all(
    params.ids.map((id) => getOneHandler(resource, { id }))
  );
  return { data: data.map((d) => d.data) };
}

async function getManyReferenceHandler(
  resource: ResourceType,
  params: {
    target: string;
    id: string | number;
    pagination?: { page: number; perPage: number };
    sort?: { field: string; order: 'ASC' | 'DESC' };
    filter?: Record<string, any>;
  }
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
  }
) {
  
  const results = await Promise.all(
    params.ids.map((id) =>
      updateHandler(resource, { id, data: params.data })
    )
  );
  return { data: results.map((r) => r.data) };
}

async function deleteManyHandler(
  resource: ResourceType,
  params: { ids: (string | number)[] }
) {
  
  const results = await Promise.all(
    params.ids.map((id) => deleteHandler(resource, { id }))
  );
  return { data: results.map((r) => r.data) };
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
  deleteMany: (resource: string, params: any) =>
    deleteManyHandler(resource as ResourceType, params),
};

export default dataProvider;