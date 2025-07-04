/**
 * FILE UPLOAD CONFIGURATION
 * 
 * This file defines all configuration settings related to file uploads in the application.
 * It provides comprehensive upload constraints, file type validation, storage paths, and
 * image processing parameters for a robust and secure file handling system.
 * 
 * Key Features:
 * - File size limits (individual and total) to prevent server overload
 * - Whitelist of allowed MIME types and file extensions for security
 * - Context-specific file limits (products vs used boards)
 * - Organized directory structure for different file types
 * - Public URL mapping for serving uploaded files
 * - Future-ready image dimension constraints for optimization
 * 
 * Security Benefits:
 * - Prevents malicious file uploads through strict type validation
 * - Limits file sizes to protect server resources
 * - Segregates uploads by context for better organization
 * 
 * Usage:
 * - Import in ImageService for validation and storage operations
 * - Used by file upload middleware and validation layers
 * - Reference for frontend upload components
 */

export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024,
  maxTotalSize: 25 * 1024 * 1024,

  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  
  maxFiles: {
    products: 3,
    usedBoards: 3
  },
  
  minFiles: {
    products: 1,
    usedBoards: 1
  },
  
  directories: {
    products: 'public/uploads/products',
    usedBoards: 'public/uploads/boards',
    temp: 'public/uploads/temp'
  },
  
  publicUrls: {
    products: '/uploads/products',
    usedBoards: '/uploads/boards'
  },
  
  //( TODO ? : pouvoir cropper les images plus tard)
  imageDimensions: {
    maxWidth: 2048,
    maxHeight: 2048,
    thumbnailSize: 300
  }
} as const

export type UploadDirectory = keyof typeof UPLOAD_CONFIG.directories