export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: string[]
  message?: string
}

export interface ValidationResult<T = unknown> {
  isValid: boolean
  errors: string[]
  data?: T
}

// TODO : Mettre en place pagination côté back -> catalogue et dashboard
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ApiError extends Error {
  statusCode: number
  details?: string[]
}
