export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 50,
  MIN_LIMIT: 1,
} as const;

export function calculatePaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit) || 1;
  
  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

export function normalizePaginationParams(params: PaginationParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(
    PAGINATION_CONFIG.DEFAULT_PAGE,
    params.page || PAGINATION_CONFIG.DEFAULT_PAGE
  );

  const rawLimit = params.limit || PAGINATION_CONFIG.DEFAULT_LIMIT;
  const limit = Math.min(
    PAGINATION_CONFIG.MAX_LIMIT,
    Math.max(PAGINATION_CONFIG.MIN_LIMIT, rawLimit)
  );

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    meta: calculatePaginationMeta(total, page, limit),
  };
}

export function extractPaginationFromSearchParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
): { page: number; limit: number; skip: number } {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  return normalizePaginationParams({ page, limit });
}