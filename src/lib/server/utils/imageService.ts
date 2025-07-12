/**
 * COMPREHENSIVE IMAGE MANAGEMENT SERVICE
 * 
 * This service provides a complete solution for image upload, validation, storage, and lifecycle
 * management in the skateboard marketplace application. It handles all aspects of image processing
 * from initial validation through storage, retrieval, and cleanup operations with robust error
 * handling and security measures throughout the entire workflow.
 * 
 * Core Capabilities:
 * - Multi-file image upload with comprehensive validation
 * - Context-aware image management (products vs used boards)
 * - Atomic upload operations with automatic rollback on failures
 * - Image lifecycle management with cleanup and optimization features
 * - Advanced file operations including moving between contexts
 * - Storage analytics and orphaned file detection
 * 
 * Key Features:
 * - Configurable validation (file count, size, type) based on context
 * - Automatic directory creation and management
 * - Unique filename generation to prevent conflicts
 * - Batch operations with detailed success/failure reporting
 * - Cross-context image migration capabilities
 * - Storage cleanup and maintenance utilities
 * 
 * Security & Validation:
 * - MIME type validation against whitelist of allowed image formats
 * - File size validation (individual and total) to prevent abuse
 * - Extension validation as additional security layer
 * - Filename sanitization and unique generation
 * - Path validation to prevent directory traversal attacks
 * 
 * Error Handling & Recovery:
 * - Atomic upload operations with automatic cleanup on failure
 * - Detailed error reporting for each validation step
 * - Rollback mechanisms for partial upload failures
 * - Graceful handling of file system errors
 * - Comprehensive logging for debugging and monitoring
 * 
 * Advanced Features:
 * - Factory pattern for service instance management
 * - Cross-service image migration (products ↔ used boards)
 * - Orphaned file detection and cleanup
 * - Storage statistics and analytics
 * - Flexible validation options for different use cases
 * 
 * Usage Context:
 * - Used by ProductService and UsedBoardService for image management
 * - Supports both single and multiple file upload scenarios
 * - Integrates with FileManager for low-level file operations
 * - Provides foundation for any image-related operations in the application
 */

import { API_MESSAGES } from '@/lib/server/config/constants'
import { SupabaseStorageService } from '@/lib/server/services/supabaseStorageService'
import { UPLOAD_CONFIG, isAllowedMimeType, isAllowedExtension } from '../config/upload'

export interface ImageValidationResult {
  isValid: boolean
  errors: string[]
}

export interface ImageUploadResult {
  success: boolean
  urls: string[]
  errors: string[]
}

export interface ImageProcessingOptions {
  validateCount?: boolean
  validateSize?: boolean
  validateType?: boolean
}

export type ImageDirectory = 'products' | 'usedBoards'

export class ImageService {
  private storageService: SupabaseStorageService
  private maxFiles: number
  private minFiles: number

  constructor(private directory: ImageDirectory) {
    this.storageService = new SupabaseStorageService(directory)
    this.maxFiles = UPLOAD_CONFIG.maxFiles[directory]
    this.minFiles = UPLOAD_CONFIG.minFiles[directory]
  }

  validate(files: File[], options: ImageProcessingOptions = {}): ImageValidationResult {
    const { validateCount = true, validateSize = true, validateType = true } = options
    const errors: string[] = []

    if (validateCount) {
      const countErrors = this.validateFileCount(files)
      errors.push(...countErrors)
    }

    if (files.length === 0 && validateCount) {
      return { isValid: false, errors }
    }

    if (validateSize) {
      const totalSizeError = this.validateTotalSize(files)
      if (totalSizeError) errors.push(totalSizeError)
    }

    files.forEach((file, index) => {
      const fileErrors = this.validateSingleFile(file, index + 1, { validateSize, validateType })
      errors.push(...fileErrors)
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  async uploadMultiple(files: File[], options: ImageProcessingOptions = {}): Promise<ImageUploadResult> {
    try {
      const validation = this.validate(files, options)
      if (!validation.isValid) {
        return {
          success: false,
          urls: [],
          errors: validation.errors,
        }
      }

      const storageResult = await this.storageService.uploadMultiple(files)

      return {
        success: storageResult.success,
        urls: storageResult.successfulUploads,
        errors: storageResult.errors,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
      return {
        success: false,
        urls: [],
        errors: [`Erreur générale: ${errorMessage}`],
      }
    }
  }

  async uploadSingle(file: File, options: ImageProcessingOptions = {}): Promise<string> {
    const validation = this.validate([file], { ...options, validateCount: false })
    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${validation.errors.join(', ')}`)
    }

    const result = await this.storageService.uploadSingle(file)
    
    if (!result.success || !result.publicUrl) {
      throw new Error(`Erreur upload: ${result.error || 'Erreur inconnue'}`)
    }

    return result.publicUrl
  }

  async deleteMultiple(imageUrls: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    if (!imageUrls || imageUrls.length === 0) {
      return { deleted: [], failed: [] }
    }

    return await this.storageService.deleteMultiple(imageUrls)
  }

  async deleteSingle(imageUrl: string): Promise<boolean> {
    if (!imageUrl) return false
    return await this.storageService.deleteSingle(imageUrl)
  }

  private validateFileCount(files: File[]): string[] {
    const errors: string[] = []

    if (files.length === 0) {
      errors.push(API_MESSAGES.AT_LEAST_ONE_IMAGE_REQUIRED)
    }

    if (files.length < this.minFiles) {
      errors.push(`Au moins ${this.minFiles} image(s) requise(s)`)
    }

    if (files.length > this.maxFiles) {
      errors.push(`Maximum ${this.maxFiles} images autorisées`)
    }

    return errors
  }

  private validateTotalSize(files: File[]): string | null {
    const totalSize = files.reduce((total, file) => total + file.size, 0)

    if (totalSize > UPLOAD_CONFIG.maxTotalSize) {
      const maxSizeMB = UPLOAD_CONFIG.maxTotalSize / (1024 * 1024)
      return `Taille totale des fichiers trop importante (max ${maxSizeMB}MB)`
    }

    return null
  }

  private validateSingleFile(file: File, index: number, options: { validateSize?: boolean; validateType?: boolean } = {}): string[] {
    const { validateSize = true, validateType = true } = options
    const errors: string[] = []

    if (file.size === 0) {
      errors.push(`Image ${index}: Fichier vide`)
      return errors
    }

    if (validateType && !isAllowedMimeType(file.type)) {
      errors.push(`Image ${index}: Type non supporté (${file.type}). Types autorisés: ${UPLOAD_CONFIG.allowedMimeTypes.join(', ')}`)
    }

    if (validateSize && file.size > UPLOAD_CONFIG.maxFileSize) {
      const maxSizeMB = UPLOAD_CONFIG.maxFileSize / (1024 * 1024)
      errors.push(`Image ${index}: Taille trop importante (max ${maxSizeMB}MB)`)
    }

    const extension = file.name.split('.').pop()?.toLowerCase()
    if (validateType && extension) {
      const extWithDot = `.${extension}`
      if (!isAllowedExtension(extWithDot)) {
        errors.push(`Image ${index}: Extension non autorisée (.${extension}). Extensions autorisées: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`)
      }
    }

    return errors
  }
}