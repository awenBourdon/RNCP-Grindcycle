/**
 * STANDARDIZED API RESPONSE BUILDER
 * 
 * This helper class provides a comprehensive set of static methods for creating consistent,
 * well-structured HTTP responses across the entire API. It standardizes response formatting,
 * status codes, and error handling patterns to ensure a uniform client experience and
 * simplified response management throughout all controllers and services.
 * 
 * Core Responsibilities:
 * - Standardized response format with consistent JSON structure
 * - HTTP status code management with semantic meaning
 * - Error response formatting with detailed error information
 * - Success response patterns for different operation types
 * - Special response types (redirects, downloads, custom headers)
 * 
 * Key Features:
 * - Type-safe response building with generic support
 * - Consistent error message formatting and categorization
 * - Flexible response options with optional messages and details
 * - Built-in support for validation errors with detailed field information
 * - Custom header support for specialized responses
 * - RESTful status code usage following HTTP standards
 * 
 * Response Format Standardization:
 * All responses follow a consistent structure:
 * - success: boolean indicating operation success/failure
 * - data: actual response payload (for successful operations)
 * - error: error message (for failed operations)
 * - message: optional success/informational message
 * - details: optional array of detailed error information
 * 
 * HTTP Status Code Usage:
 * - 200 OK: Successful GET, PUT, PATCH operations
 * - 201 Created: Successful POST operations creating new resources
 * - 204 No Content: Successful DELETE operations
 * - 400 Bad Request: Client errors, invalid input
 * - 401 Unauthorized: Authentication required
 * - 403 Forbidden: Access denied
 * - 404 Not Found: Resource doesn't exist
 * - 409 Conflict: Resource conflicts (duplicates)
 * - 422 Unprocessable Entity: Validation errors
 * - 500 Internal Server Error: Server-side errors
 * 
 * Usage Context:
 * - Used by all controllers for consistent response formatting
 * - Integrates with validation systems for error reporting
 * - Supports both simple and complex response scenarios
 * - Facilitates easy testing and client integration
 */

import { NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/server/types/api'
import { HTTP_STATUS, API_MESSAGES } from '@/lib/server/config/constants'

export class ResponseHelper {
  static success<T>(
    data: T, 
    message?: string, 
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response: ApiResponse<T> = {
      success: true,
      data,
      ...(message && { message })
    }
    return NextResponse.json(response, { status })
  }

  static successMessage(
    message: string, 
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response: ApiResponse = {
      success: true,
      message
    }
    return NextResponse.json(response, { status })
  }

  static error(
    error: string, 
    status: number = HTTP_STATUS.BAD_REQUEST, 
    details?: string[]
  ): NextResponse {
    const response: ApiResponse = {
      success: false,
      error,
      ...(details && { details })
    }
    return NextResponse.json(response, { status })
  }

  static validationError(errors: string[]): NextResponse {
    return this.error(
      API_MESSAGES.INVALID_DATA, 
      HTTP_STATUS.UNPROCESSABLE_ENTITY, 
      errors
    )
  }

  static serverError(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.SERVER_ERROR, 
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    )
  }

  static notFound(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.NOT_FOUND, 
      HTTP_STATUS.NOT_FOUND
    )
  }

  static unauthorized(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.UNAUTHORIZED, 
      HTTP_STATUS.UNAUTHORIZED
    )
  }

  static forbidden(message?: string): NextResponse {
    return this.error(
      message || API_MESSAGES.FORBIDDEN, 
      HTTP_STATUS.FORBIDDEN
    )
  }

  static conflict(message: string): NextResponse {
    return this.error(message, HTTP_STATUS.CONFLICT)
  }

  static created<T>(data: T, message?: string): NextResponse {
    return this.success(data, message, HTTP_STATUS.CREATED)
  }

  static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 })
  }

  static redirect(url: string, permanent: boolean = false): NextResponse {
    const status = permanent ? 301 : 302
    return NextResponse.redirect(url, status)
  }

  static withHeaders<T>(
    data: T,
    headers: Record<string, string>,
    status: number = HTTP_STATUS.OK
  ): NextResponse {
    const response = NextResponse.json({
      success: true,
      data
    }, { status })

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })

    return response
  }
}


//   /**
//    * Réponse de téléchargement de fichier
//    */
//   static download(
//     data: Buffer | Uint8Array,
//     filename: string,
//     mimeType: string = 'application/octet-stream'
//   ): NextResponse {
//     const response = new NextResponse(data, {
//       status: HTTP_STATUS.OK,
//       headers: {
//         'Content-Type': mimeType,
//         'Content-Disposition': `attachment; filename="${filename}"`,
//         'Cache-Control': 'no-cache'
//       }
//     })

//     return response
//   }
 