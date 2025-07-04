/**
 * ABSTRACT BASE CONTROLLER
 * 
 * This abstract class provides common functionality and standardized patterns for all API controllers
 * in the application. It implements the DRY (Don't Repeat Yourself) principle by centralizing
 * shared controller logic and ensuring consistent error handling across all endpoints.
 * 
 * Key Features:
 * - Standardized error handling with proper logging and user-friendly responses
 * - Request data extraction utilities for both JSON and FormData payloads
 * - Content-type detection for handling different request formats
 * - Consistent error response formatting using ResponseHelper
 * 
 * Benefits:
 * - Reduces code duplication across controllers
 * - Ensures consistent error handling patterns
 * - Simplifies request data extraction
 * - Provides a clean inheritance structure for specific controllers
 * 
 * Usage:
 * - Extended by ProductController, UsedBoardController, etc.
 * - Each concrete controller inherits these common utilities
 * - Maintains separation of concerns while sharing functionality
 */

import { NextRequest } from 'next/server'
import { ResponseHelper } from '@/lib/server/utils/responseHelper'

export abstract class BaseController {
  protected handleError(error: unknown, context: string) {
    console.error(`Erreur dans ${context}:`, error)
    
    if (error instanceof Error) {
      return ResponseHelper.error(error.message)
    }
    
    return ResponseHelper.serverError()
  }

  protected extractFormData(req: NextRequest): Promise<FormData> {
    return req.formData()
  }

  protected extractJsonData(req: NextRequest): Promise<unknown> {
    return req.json()
  }

  protected isFormDataRequest(req: NextRequest): boolean {
    const contentType = req.headers.get('content-type') || ''
    return contentType.includes('multipart/form-data')
  }
}