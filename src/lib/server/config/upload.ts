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
    products: 5,
    usedBoards: 5
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
  
  //(si on veut ajouter le redimensionnement plus tard)
  imageDimensions: {
    maxWidth: 2048,
    maxHeight: 2048,
    thumbnailSize: 300
  }
} as const

export type UploadDirectory = keyof typeof UPLOAD_CONFIG.directories