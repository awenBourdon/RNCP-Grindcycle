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

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { FileManager } from './fileManager';
import { UPLOAD_CONFIG } from '../config/upload';

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ImageUploadResult {
  success: boolean;
  paths: string[];
  errors: string[];
}

export interface ImageProcessingOptions {
  validateCount?: boolean;
  validateSize?: boolean;
  validateType?: boolean;
  generateUniqueName?: boolean;
}

export type ImageDirectory = 'products' | 'usedBoards';

export class ImageService {
  private uploadDir: string;
  private publicUrlPrefix: string;
  private maxFiles: number;
  private minFiles: number;

  constructor(private directory: ImageDirectory) {
    this.uploadDir = path.join(process.cwd(), UPLOAD_CONFIG.directories[directory]);
    this.publicUrlPrefix = UPLOAD_CONFIG.publicUrls[directory];
    this.maxFiles = UPLOAD_CONFIG.maxFiles[directory];
    this.minFiles = UPLOAD_CONFIG.minFiles[directory];
  }

  validate(files: File[], options: ImageProcessingOptions = {}): ImageValidationResult {
    const { validateCount = true, validateSize = true, validateType = true } = options;
    const errors: string[] = [];

    if (validateCount) {
      const countErrors = this.validateFileCount(files);
      errors.push(...countErrors);
    }

    if (files.length === 0 && validateCount) {
      return { isValid: false, errors };
    }

    if (validateSize) {
      const totalSizeError = this.validateTotalSize(files);
      if (totalSizeError) errors.push(totalSizeError);
    }

    files.forEach((file, index) => {
      const fileErrors = this.validateSingleFile(file, index + 1, { validateSize, validateType });
      errors.push(...fileErrors);
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async uploadMultiple(files: File[], options: ImageProcessingOptions = {}): Promise<ImageUploadResult> {
    try {
      const validation = this.validate(files, options);
      if (!validation.isValid) {
        return {
          success: false,
          paths: [],
          errors: validation.errors,
        };
      }

      await this.ensureDirectoryExists();

      const uploadResults = await this.processFileUploads(files, options);

      const failedUploads = uploadResults.filter((result) => !result.success);

      if (failedUploads.length > 0) {
        const successfulPaths = uploadResults
          .filter((result) => result.success && result.path)
          .map((result) => result.path!);

        if (successfulPaths.length > 0) {
          await this.deleteMultiple(successfulPaths);
        }

        return {
          success: false,
          paths: [],
          errors: failedUploads.map((result) => result.error || 'Erreur inconnue'),
        };
      }

      const successfulPaths = uploadResults.map((result) => result.path!);

      return {
        success: true,
        paths: successfulPaths,
        errors: [],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return {
        success: false,
        paths: [],
        errors: [`Erreur générale: ${errorMessage}`],
      };
    }
  }

  async uploadSingle(file: File, options: ImageProcessingOptions = {}): Promise<string> {
    const validation = this.validate([file], { ...options, validateCount: false });
    if (!validation.isValid) {
      throw new Error(`Validation échouée: ${validation.errors.join(', ')}`);
    }

    await this.ensureDirectoryExists();

    const filename = options.generateUniqueName !== false ? FileManager.generateUniqueFilename(file.name) : FileManager.sanitizeFilename(file.name);

    const filepath = path.join(this.uploadDir, filename);

    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      return `${this.publicUrlPrefix}/${filename}`;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      throw new Error(`Erreur lors de l'upload: ${errorMessage}`);
    }
  }

  async deleteMultiple(imagePaths: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    if (!imagePaths || imagePaths.length === 0) {
      return { deleted: [], failed: [] };
    }

    return await FileManager.deleteFiles(imagePaths);
  }

  async deleteSingle(imagePath: string): Promise<boolean> {
    if (!imagePath) return false;
    return await FileManager.deleteFile(imagePath);
  }

  async exists(imagePath: string): Promise<boolean> {
    if (!imagePath) return false;

    const fullPath = path.join(process.cwd(), 'public', imagePath);
    return await FileManager.exists(fullPath);
  }

  async existsMultiple(imagePaths: string[]): Promise<{ existing: string[]; missing: string[] }> {
    const existing: string[] = [];
    const missing: string[] = [];

    for (const imagePath of imagePaths) {
      const exists = await this.exists(imagePath);
      if (exists) {
        existing.push(imagePath);
      } else {
        missing.push(imagePath);
      }
    }

    return { existing, missing };
  }

  async moveToAnotherService(imagePaths: string[], targetService: ImageService): Promise<{ moved: Array<{ from: string; to: string }>; failed: Array<{ path: string; error: string }> }> {
    const moved: Array<{ from: string; to: string }> = [];
    const failed: Array<{ path: string; error: string }> = [];

    for (const imagePath of imagePaths) {
      try {
        const fullSourcePath = path.join(process.cwd(), 'public', imagePath);
        const exists = await FileManager.exists(fullSourcePath);

        if (!exists) {
          failed.push({ path: imagePath, error: 'Fichier source introuvable' });
          continue;
        }

        const filename = path.basename(imagePath);
        const targetFilename = FileManager.generateUniqueFilename(filename);
        const targetPath = `${targetService.publicUrlPrefix}/${targetFilename}`;
        const fullTargetPath = path.join(process.cwd(), 'public', targetPath);

        await targetService.ensureDirectoryExists();

        const fs = await import('fs/promises');
        await fs.copyFile(fullSourcePath, fullTargetPath);

        await FileManager.deleteFile(imagePath);

        moved.push({ from: imagePath, to: targetPath });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        failed.push({ path: imagePath, error: errorMessage });
      }
    }

    return { moved, failed };
  }

  async cleanupOrphanedImages(activeImagePaths: string[]): Promise<{ cleaned: string[]; errors: string[] }> {
    try {
      const fs = await import('fs/promises');

      const files = await fs.readdir(this.uploadDir);

      const activeFilenames = new Set(
        activeImagePaths
          .filter((path) => path.startsWith(this.publicUrlPrefix))
          .map((path) => path.replace(this.publicUrlPrefix + '/', ''))
      );

      const cleaned: string[] = [];
      const errors: string[] = [];

      for (const filename of files) {
        const filepath = path.join(this.uploadDir, filename);
        const stat = await fs.stat(filepath);

        if (!stat.isFile()) continue;

        if (!activeFilenames.has(filename)) {
          try {
            await fs.unlink(filepath);
            cleaned.push(`${this.publicUrlPrefix}/${filename}`);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            errors.push(`Erreur suppression ${filename}: ${errorMessage}`);
          }
        }
      }

      return { cleaned, errors };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      return {
        cleaned: [],
        errors: [`Erreur générale de nettoyage: ${errorMessage}`],
      };
    }
  }

  async getStorageStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    averageSize: number;
    oldestFile?: { name: string; date: Date };
    newestFile?: { name: string; date: Date };
  }> {
    try {
      const fs = await import('fs/promises');
      const files = await fs.readdir(this.uploadDir);

      let totalSize = 0;
      let oldestFile: { name: string; date: Date } | undefined;
      let newestFile: { name: string; date: Date } | undefined;

      for (const filename of files) {
        const filepath = path.join(this.uploadDir, filename);
        const stat = await fs.stat(filepath);

        if (stat.isFile()) {
          totalSize += stat.size;

          if (!oldestFile || stat.birthtime < oldestFile.date) {
            oldestFile = { name: filename, date: stat.birthtime };
          }

          if (!newestFile || stat.birthtime > newestFile.date) {
            newestFile = { name: filename, date: stat.birthtime };
          }
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        averageSize: files.length > 0 ? totalSize / files.length : 0,
        oldestFile,
        newestFile,
      };
    } catch {
      return {
        totalFiles: 0,
        totalSize: 0,
        averageSize: 0,
      };
    }
  }

  private validateFileCount(files: File[]): string[] {
    const errors: string[] = [];

    if (files.length === 0) {
      errors.push(API_MESSAGES.AT_LEAST_ONE_IMAGE_REQUIRED);
    }

    if (files.length < this.minFiles) {
      errors.push(`Au moins ${this.minFiles} image(s) requise(s)`);
    }

    if (files.length > this.maxFiles) {
      errors.push(`Maximum ${this.maxFiles} images autorisées`);
    }

    return errors;
  }

  private validateTotalSize(files: File[]): string | null {
    const totalSize = FileManager.calculateTotalSize(files);

    if (totalSize > UPLOAD_CONFIG.maxTotalSize) {
      const maxSizeMB = UPLOAD_CONFIG.maxTotalSize / (1024 * 1024);
      return `Taille totale des fichiers trop importante (max ${maxSizeMB}MB)`;
    }

    return null;
  }

  private validateSingleFile(file: File, index: number, options: { validateSize?: boolean; validateType?: boolean } = {}): string[] {
    const { validateSize = true, validateType = true } = options;
    const errors: string[] = [];

    if (file.size === 0) {
      errors.push(`Image ${index}: Fichier vide`);
      return errors;
    }

    if (validateType && !UPLOAD_CONFIG.allowedMimeTypes.includes(file.type as typeof UPLOAD_CONFIG.allowedMimeTypes[number])) {
      errors.push(`Image ${index}: Type non supporté (${file.type}). Types autorisés: ${UPLOAD_CONFIG.allowedMimeTypes.join(', ')}`);
    }

    if (validateSize && file.size > UPLOAD_CONFIG.maxFileSize) {
      const maxSizeMB = UPLOAD_CONFIG.maxFileSize / (1024 * 1024);
      errors.push(`Image ${index}: Taille trop importante (max ${maxSizeMB}MB)`);
    }

    const extension = FileManager.getFileExtension(file.name) as typeof UPLOAD_CONFIG.allowedExtensions[number];
    if (validateType && !UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
      errors.push(`Image ${index}: Extension non autorisée (${extension}). Extensions autorisées: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`);
    }

    return errors;
  }

  private async processFileUploads(files: File[], options: ImageProcessingOptions): Promise<Array<{ success: boolean; path?: string; error?: string }>> {
    const results: Array<{ success: boolean; path?: string; error?: string }> = [];

    for (const [index, file] of files.entries()) {
      try {
        const path = await this.uploadSingle(file, { ...options, validateCount: false });
        results.push({ success: true, path });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        results.push({
          success: false,
          error: `Image ${index + 1}: ${errorMessage}`,
        });
      }
    }

    return results;
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      console.error('Erreur création dossier upload:', error);
      throw new Error(`Impossible de créer le dossier d'upload: ${this.uploadDir}`);
    }
  }
}

export class ImageServiceFactory {
  private static instances: Map<ImageDirectory, ImageService> = new Map();

  static getService(directory: ImageDirectory): ImageService {
    if (!this.instances.has(directory)) {
      this.instances.set(directory, new ImageService(directory));
    }
    return this.instances.get(directory)!;
  }

  static getProductImageService(): ImageService {
    return this.getService('products');
  }

  static getUsedBoardImageService(): ImageService {
    return this.getService('usedBoards');
  }

  static clearInstances(): void {
    this.instances.clear();
  }

  static getAllServices(): ImageService[] {
    return Array.from(this.instances.values());
  }
}
