// lib/server/utils/imageService.ts
import { API_MESSAGES } from '@/lib/server/config/constants'
import { UPLOAD_CONFIG, isAllowedMimeType, isAllowedExtension } from '../config/upload'

// Import dynamique de SupabaseStorageService

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private storageService: any = null
  private maxFiles: number
  private minFiles: number

  constructor(private directory: ImageDirectory) {
    this.maxFiles = UPLOAD_CONFIG.maxFiles[directory]
    this.minFiles = UPLOAD_CONFIG.minFiles[directory]
    // Ne pas initialiser storageService ici
  }

  // Lazy loading du service de stockage
  private async getStorageService() {
    if (!this.storageService) {
      // Import dynamique seulement quand nécessaire
      const { SupabaseStorageService } = await import('@/lib/server/services/supabaseStorageService')
      this.storageService = new SupabaseStorageService(this.directory)
    }
    return this.storageService
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

      // Lazy loading du service
      const storageService = await this.getStorageService()
      const storageResult = await storageService.uploadMultiple(files)

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

    const storageService = await this.getStorageService()
    const result = await storageService.uploadSingle(file)
    
    if (!result.success || !result.publicUrl) {
      throw new Error(`Erreur upload: ${result.error || 'Erreur inconnue'}`)
    }

    return result.publicUrl
  }

  async deleteMultiple(imageUrls: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    if (!imageUrls || imageUrls.length === 0) {
      return { deleted: [], failed: [] }
    }

    const storageService = await this.getStorageService()
    return await storageService.deleteMultiple(imageUrls)
  }

  async deleteSingle(imageUrl: string): Promise<boolean> {
    if (!imageUrl) return false
    const storageService = await this.getStorageService()
    return await storageService.deleteSingle(imageUrl)
  }

  // Méthodes de validation (identiques à avant)
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

export class ImageServiceFactory {
  private static instances: Map<ImageDirectory, ImageService> = new Map()

  static getService(directory: ImageDirectory): ImageService {
    if (!this.instances.has(directory)) {
      this.instances.set(directory, new ImageService(directory))
    }
    return this.instances.get(directory)!
  }

  static getProductImageService(): ImageService {
    return this.getService('products')
  }

  static getUsedBoardImageService(): ImageService {
    return this.getService('usedBoards')
  }

  static clearInstances(): void {
    this.instances.clear()
  }
}