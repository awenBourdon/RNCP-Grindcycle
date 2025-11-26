import {
  isAllowedExtension,
  isAllowedMimeType,
  UPLOAD_CONFIG,
} from '../server/upload-images/upload';

export interface ImageValidationInterface {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details?: {
    dimensions?: { width: number; height: number };
    actualMimeType?: string;
    suspiciousContent?: boolean;
  };
}

export class ImageFileGuardValidation {
  private static readonly MAGIC_NUMBERS = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]],
  };


  private static readonly SUSPICIOUS_PATTERNS = [
    /<script/gi,
    /<\?php/gi,
    /javascript:/gi,
    /<iframe/gi,
    /<embed/gi,
    /eval\(/gi,
    /document\.write/gi,
  ];

  private static readonly MAX_CONTENT_SCAN_BYTES = 4096;

  static async validateImage(
    file: File
  ): Promise<ImageValidationInterface> {
    const result: ImageValidationInterface = {
      isValid: true,
      errors: [],
      warnings: [],
      details: {},
    };

    try {
      const basicValidation = this.validateBasicProperties(file);
      if (!basicValidation.isValid) {
        result.errors.push(...basicValidation.errors);
        result.isValid = false;
      }

      const buffer = await this.fileToArrayBuffer(file);
      const bytes = new Uint8Array(buffer);

      const magicValidation = this.validateMagicNumber(bytes, file.type);
      if (!magicValidation.isValid) {
        result.errors.push(...magicValidation.errors);
        result.isValid = false;
      }

      if (!result.details) {
        result.details = {};
      }

      const contentValidation = this.scanContent(bytes);
      if (contentValidation.suspicious) {
        result.errors.push('Contenu suspect détecté dans le fichier');
        result.details.suspiciousContent = true;
        result.isValid = false;
      }

      const dimensions = await this.extractDimensions(bytes, file.type);
      if (dimensions) {
        result.details.dimensions = dimensions;

        if (dimensions.width < 10 || dimensions.height < 10) {
          result.errors.push('Image trop petite (minimum 10x10 pixels)');
          result.isValid = false;
        }

        if (
          dimensions.width > UPLOAD_CONFIG.imageDimensions.maxWidth ||
          dimensions.height > UPLOAD_CONFIG.imageDimensions.maxHeight
        ) {
          result.errors.push(
            `Image trop grande (maximum ${UPLOAD_CONFIG.imageDimensions.maxWidth}x${UPLOAD_CONFIG.imageDimensions.maxHeight} pixels)`
          );
          result.isValid = false;
        }

        const ratio =
          Math.max(dimensions.width, dimensions.height) /
          Math.min(dimensions.width, dimensions.height);
        if (ratio > 50) {
          result.warnings.push("Ratio d'image inhabituel");
        }
      }

      const filenameValidation = this.validateFilename(file.name);
      if (!filenameValidation.isValid) {
        result.errors.push(...filenameValidation.errors);
        result.isValid = false;
      }
    } catch (error) {
      result.errors.push(
        `Erreur lors de la validation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
      result.isValid = false;
    }

    return result;
  }

  private static validateBasicProperties(file: File): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!file.name || file.name.length === 0) {
      errors.push('Nom de fichier manquant');
    }

    if (file.name.length > 255) {
      errors.push('Nom de fichier trop long');
    }

    if (file.size === 0) {
      errors.push('Fichier vide');
    }

    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      errors.push(
        `Fichier trop volumineux (max ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB)`
      );
    }

    if (!isAllowedMimeType(file.type)) {
      errors.push(`Type MIME non autorisé: ${file.type}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  private static validateMagicNumber(
    bytes: Uint8Array,
    declaredMimeType: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const expectedSignatures =
      this.MAGIC_NUMBERS[declaredMimeType as keyof typeof this.MAGIC_NUMBERS];

    if (!expectedSignatures) {
      errors.push(
        `Type MIME non supporté pour validation: ${declaredMimeType}`
      );
      return { isValid: false, errors };
    }

    const isValidSignature = expectedSignatures.some(signature => {
      if (bytes.length < signature.length) return false;
      return signature.every((signatureByte, index) => bytes[index] === signatureByte);
    });

    if (!isValidSignature) {
      errors.push(
        `Le fichier n'est pas un vrai ${declaredMimeType} (signature invalide)`
      );
    }

    return { isValid: errors.length === 0, errors };
  }

  private static scanContent(buffer: Uint8Array): { suspicious: boolean } {
    try {
      const scanBuffer = buffer.slice(
        0,
        Math.min(buffer.length, this.MAX_CONTENT_SCAN_BYTES)
      );
      const textContent = new TextDecoder('utf-8', { fatal: false }).decode(
        scanBuffer
      );

      for (const pattern of this.SUSPICIOUS_PATTERNS) {
        if (pattern.test(textContent)) {
          return { suspicious: true };
        }
      }

      return { suspicious: false };
    } catch {
      return { suspicious: false };
    }
  }

  private static validateFilename(filename: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) {
      errors.push('Nom de fichier contient des caractères interdits');
    }

    const parts = filename.toLowerCase().split('.');
    if (parts.length > 2) {
      const suspiciousExtensions = ['php', 'js', 'html', 'asp', 'exe', 'com', 'bat', 'sh', 'py'];
      for (let i = 1; i < parts.length - 1; i++) {
        if (suspiciousExtensions.includes(parts[i])) {
          errors.push('Extension suspecte détectée dans le nom de fichier');
          break;
        }
      }
    }

    const finalExtension = '.' + parts[parts.length - 1];
    if (!isAllowedExtension(finalExtension)) {
      errors.push(`Extension non autorisée: ${finalExtension}`);
    }

    return { isValid: errors.length === 0, errors };
  }

  private static async extractDimensions(
    bytes: Uint8Array,
    mimeType: string
  ): Promise<{ width: number; height: number } | null> {
    try {
      switch (mimeType) {
        case 'image/png':
          return this.extractPngDimensions(bytes);
        case 'image/jpeg':
          return this.extractJpegDimensions(bytes);
        case 'image/webp':
          return this.extractWebpDimensions(bytes);
        default:
          return null;
      }
    } catch (error) {
      console.warn('Erreur extraction dimensions:', error);
      return null;
    }
  }


  private static extractPngDimensions(
    bytes: Uint8Array
  ): { width: number; height: number } | null {
    if (bytes.length < 24) return null;

    const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    for (let i = 0; i < pngSignature.length; i++) {
      if (bytes[i] !== pngSignature[i]) return null;
    }

    const width =
      (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
    const height =
      (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];

    if (width <= 0 || height <= 0 || width > 0x7fffffff || height > 0x7fffffff) {
      return null;
    }

    return { width, height };
  }

  private static extractJpegDimensions(
    bytes: Uint8Array
  ): { width: number; height: number } | null {
    if (bytes.length < 10) return null;

    let i = 2;

    while (i < bytes.length - 9) {
      if (bytes[i] !== 0xff) {
        i++;
        continue;
      }

      const marker = bytes[i + 1];

      if (marker === 0x00) {
        i += 2;
        continue;
      }

      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 && 
        marker !== 0xcc 
      ) {
        if (i + 9 > bytes.length) return null;

        const height = (bytes[i + 5] << 8) | bytes[i + 6];
        const width = (bytes[i + 7] << 8) | bytes[i + 8];

        if (width <= 0 || height <= 0) {
          i += 2;
          continue;
        }

        return { width, height };
      }

      if (i + 3 > bytes.length) break;

      const segmentLength = (bytes[i + 2] << 8) | bytes[i + 3];
      i += 2 + segmentLength;
    }

    return null;
  }

  private static extractWebpDimensions(
    bytes: Uint8Array
  ): { width: number; height: number } | null {
    if (bytes.length < 30) return null;

    if (
      bytes[0] !== 0x52 ||
      bytes[1] !== 0x49 || 
      bytes[2] !== 0x46 ||
      bytes[3] !== 0x46 
    ) {
      return null;
    }

    if (
      bytes[8] !== 0x57 ||
      bytes[9] !== 0x45 ||
      bytes[10] !== 0x42 || 
      bytes[11] !== 0x50 
    ) {
      return null;
    }

    const chunkType = new TextDecoder('utf-8', { fatal: false }).decode(
      bytes.slice(12, 16)
    );

    if (chunkType === 'VP8 ') {
      if (bytes.length < 30) return null;
      const width = ((bytes[26] | (bytes[27] << 8)) & 0x3fff) + 1;
      const height = ((bytes[28] | (bytes[29] << 8)) & 0x3fff) + 1;
      return { width, height };
    }

    if (chunkType === 'VP8L') {
      if (bytes.length < 21) return null;
      const size = bytes[20];
      const width = ((size & 0x3f) + 1) * 1;
      const height = (((size >> 6) & 0x3f) + 1) * 1;
      return { width, height };
    }

    if (chunkType === 'VP8X') {
      if (bytes.length < 26) return null;
      const width = (bytes[24] | (bytes[25] << 8) | (bytes[26] << 16)) & 0xffffff;
      const height = (bytes[27] | (bytes[28] << 8) | (bytes[29] << 16)) & 0xffffff;
      return { width: width + 1, height: height + 1 };
    }

    return null;
  }

  private static async fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return await file.arrayBuffer();
  }


  static generateSecureFilename(originalName: string): string {
    const sanitized = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .replace(/^_|_$/g, '');

    const extension = sanitized.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const counter = Math.floor(Math.random() * 10000);

    return `img_${timestamp}_${counter}_${random}.${extension}`;
  }

  static async validateMultipleImages(files: File[]): Promise<{
    isValid: boolean;
    results: Array<{ file: File; validation: ImageValidationInterface }>;
    globalErrors: string[];
  }> {
    const results = [];
    const globalErrors: string[] = [];

    if (files.length === 0) {
      globalErrors.push('Aucun fichier fourni');
    }

    if (files.length > UPLOAD_CONFIG.maxFiles.products) {
      globalErrors.push(
        `Trop de fichiers (max ${UPLOAD_CONFIG.maxFiles.products})`
      );
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > UPLOAD_CONFIG.maxTotalSize) {
      globalErrors.push(
        `Taille totale trop importante (max ${UPLOAD_CONFIG.maxTotalSize / (1024 * 1024)}MB)`
      );
    }

    const validationPromises = files.map(file =>
      this.validateImage(file).then(validation => ({ file, validation }))
    );

    try {
      const allResults = await Promise.all(validationPromises);
      results.push(...allResults);
    } catch {
      globalErrors.push('Erreur lors de la validation des fichiers');
    }

    const allValid =
      globalErrors.length === 0 && results.every(r => r.validation.isValid);

    return {
      isValid: allValid,
      results,
      globalErrors,
    };
  }
}