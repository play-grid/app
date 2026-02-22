export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationResponse<TData> {
  data: TData[];
  pagination: PaginationMeta;
}

export interface FilterParams {
  [key: string]: any;
}

export interface SortParams {
  sort: string;
  order: 'asc' | 'desc';
}

export interface AdminListQuery extends PaginationParams, SortParams {
  search?: string;
  [key: string]: any;
}

export type WhereCondition = any;

export interface OrderBy { asc: () => void; desc: () => void }
