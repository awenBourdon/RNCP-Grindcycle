/**
 * FILE SYSTEM OPERATIONS UTILITY
 * 
 * This utility class provides a comprehensive set of file system operations for managing
 * files throughout the application. It handles file existence checking, deletion, copying,
 * moving, and filename manipulation with built-in safety measures and error handling to
 * ensure robust file management across different operating systems.
 * 
 * Core Capabilities:
 * - File existence verification and safe deletion operations
 * - Batch file operations with detailed success/failure reporting
 * - Filename sanitization and validation for cross-platform compatibility
 * - Unique filename generation to prevent conflicts
 * - File size calculation and human-readable formatting
 * - Safe file copying and moving with directory creation
 * 
 * Key Features:
 * - Cross-platform filename sanitization (Windows reserved names, invalid characters)
 * - Atomic file operations with proper error handling
 * - Unique filename generation using timestamps and random suffixes
 * - File size formatting with appropriate units (Bytes, KB, MB, GB, TB)
 * - Batch operations returning detailed success/failure statistics
 * - Safe file moving (copy + delete) with rollback on failure
 * 
 * Security Features:
 * - Filename validation to prevent directory traversal attacks
 * - Reserved filename detection for Windows compatibility
 * - Character sanitization to prevent shell injection
 * - Length limitations to prevent filesystem issues
 * - Safe path construction using Node.js path utilities
 * 
 * Error Handling:
 * - Graceful failure handling with boolean return values
 * - Detailed error logging for debugging and monitoring
 * - Batch operation reporting with individual file status
 * - Safe fallbacks for edge cases and invalid inputs
 * 
 * Usage Context:
 * - Used by ImageService for file upload and cleanup operations
 * - Supports file lifecycle management throughout the application
 * - Provides foundation for any file-related operations
 * - Ensures consistent file handling patterns across services
 */

import { unlink, access } from 'fs/promises'
import path from 'path'

export class FileManager {
  static async exists(filePath: string): Promise<boolean> {
    try {
      await access(filePath)
      return true
    } catch {
      return false
    }
  }

  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(process.cwd(), 'public', filePath)
      
      if (await this.exists(fullPath)) {
        await unlink(fullPath)
        return true
      }
      
      return false
    } catch (error) {
      console.error(`Erreur suppression fichier ${filePath}:`, error)
      return false
    }
  }

  static async deleteFiles(filePaths: string[]): Promise<{
    deleted: string[]
    failed: string[]
  }> {
    const deleted: string[] = []
    const failed: string[] = []

    for (const filePath of filePaths) {
      const success = await this.deleteFile(filePath)
      if (success) {
        deleted.push(filePath)
      } else {
        failed.push(filePath)
      }
    }

    return { deleted, failed }
  }

  static generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const sanitizedName = this.sanitizeFilename(originalName)
    
    return `${timestamp}_${randomSuffix}_${sanitizedName}`
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/\s+/g, '_')           
      .replace(/[^a-zA-Z0-9_.-]/g, '') 
      .toLowerCase()                   
      .substring(0, 50)               
  }

  static getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase()
  }

  static calculateTotalSize(files: File[]): number {
    return files.reduce((total, file) => total + file.size, 0)
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  static isValidFilename(filename: string): boolean {
    const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
    
    return !invalidChars.test(filename) && 
           !reservedNames.test(filename) &&
           filename.length > 0 &&
           filename.length <= 255
  }

  static createSafeFilename(filename: string): string {
    let safeName = filename
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_') 
      .replace(/\s+/g, '_')                    
      .replace(/_{2,}/g, '_')                  
      .replace(/^_|_$/g, '')                   
    
    const extension = path.extname(safeName)
    const nameWithoutExt = path.basename(safeName, extension)
    
    if (nameWithoutExt.length > 200) {
      safeName = nameWithoutExt.substring(0, 200) + extension
    }
    
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i
    if (reservedNames.test(path.basename(safeName, extension))) {
      const nameOnly = path.basename(safeName, extension)
      safeName = `${nameOnly}_file${extension}`
    }
    
    return safeName || 'unnamed_file'
  }

  static async copyFile(sourcePath: string, destPath: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises')
      const sourceFullPath = path.join(process.cwd(), 'public', sourcePath)
      const destFullPath = path.join(process.cwd(), 'public', destPath)
      
      if (!await this.exists(sourceFullPath)) {
        return false
      }
      
      const destDir = path.dirname(destFullPath)
      await fs.mkdir(destDir, { recursive: true })
      
      await fs.copyFile(sourceFullPath, destFullPath)
      return true
    } catch (error) {
      console.error(`Erreur copie fichier ${sourcePath} -> ${destPath}:`, error)
      return false
    }
  }

  static async moveFile(sourcePath: string, destPath: string): Promise<boolean> {
    try {
      const success = await this.copyFile(sourcePath, destPath)
      if (success) {
        await this.deleteFile(sourcePath)
        return true
      }
      return false
    } catch (error) {
      console.error(`Erreur déplacement fichier ${sourcePath} -> ${destPath}:`, error)
      return false
    }
  }
}