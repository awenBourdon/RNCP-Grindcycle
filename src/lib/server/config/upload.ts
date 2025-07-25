export const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024,
  maxTotalSize: 25 * 1024 * 1024,

  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ] as const,

  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const,

  maxFiles: {
    products: 3,
    usedBoards: 3,
  },

  minFiles: {
    products: 1,
    usedBoards: 1,
  },

  supabaseFolders: {
    products: 'products',
    usedBoards: 'used-boards',
  },

  imageDimensions: {
    maxWidth: 2048,
    maxHeight: 2048,
    thumbnailSize: 300,
  },
} as const;

export type UploadDirectory = keyof typeof UPLOAD_CONFIG.supabaseFolders;
export type AllowedMimeType = (typeof UPLOAD_CONFIG.allowedMimeTypes)[number];
export type AllowedExtension = (typeof UPLOAD_CONFIG.allowedExtensions)[number];

export function isAllowedMimeType(
  mimeType: string
): mimeType is AllowedMimeType {
  return UPLOAD_CONFIG.allowedMimeTypes.includes(mimeType as AllowedMimeType);
}

export function isAllowedExtension(
  extension: string
): extension is AllowedExtension {
  return UPLOAD_CONFIG.allowedExtensions.includes(
    extension as AllowedExtension
  );
}
