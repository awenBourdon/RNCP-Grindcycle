import { z } from 'zod';
import { BoardCondition, BoardType } from '../utils/types/types';

export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024,
  maxFiles: 3,
  acceptedFormats: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ] as const,
  acceptedFormatsDisplay: 'JPG, PNG, WebP',
  get maxSizeMB() {
    return this.maxSize / (1024 * 1024);
  },
} as const;

const imageFileSchema = z
  .instanceof(File)
  .refine(
    file => file.size <= IMAGE_CONFIG.maxSize,
    `Taille max: ${IMAGE_CONFIG.maxSizeMB}MB`
  )
  .refine(
    file =>
      (IMAGE_CONFIG.acceptedFormats as readonly string[]).includes(file.type),
    `Formats acceptés: ${IMAGE_CONFIG.acceptedFormatsDisplay}`
  );

export const recycleSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur requis'),
  name: z.string().min(1, 'Nom requis').max(100, 'Max 100 caractères'),
  boardType: z.nativeEnum(BoardType, {
    errorMap: () => ({ message: 'Type invalide' }),
  }),
  boardCondition: z.nativeEnum(BoardCondition, {
    errorMap: () => ({ message: 'État invalide' }),
  }),
  description: z.string().max(500, 'Max 500 caractères').optional(),
  images: z
    .array(imageFileSchema)
    .min(1, 'Au moins 1 photo')
    .max(IMAGE_CONFIG.maxFiles, `Max ${IMAGE_CONFIG.maxFiles} photos`),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Max 100 caractères'),
  description: z.string().max(1000, 'Max 1000 caractères').optional(),
  type: z.nativeEnum(BoardType, {
    errorMap: () => ({ message: 'Type invalide' }),
  }),
  priceEuro: z.number().min(0.01, 'Min 0.01€').max(9999.99, 'Max 9999.99€'),
  pricePoints: z
    .number()
    .min(1, 'Min 1 point')
    .max(999999, 'Max 999,999 points'),
  usedBoardId: z
    .string()
    .optional()
    .nullable()
    .transform(val => {
      if (val === '' || val === undefined) return null;
      return val;
    }),
  images: z
    .array(imageFileSchema)
    .min(1, 'Au moins 1 photo')
    .max(IMAGE_CONFIG.maxFiles, `Max ${IMAGE_CONFIG.maxFiles} photos`),
});

export type RecycleFormInput = z.infer<typeof recycleSchema>;
export type ProductInput = z.infer<typeof productSchema>;

export const formatBoardType = (type: BoardType): string => {
  const labels = {
    [BoardType.SKATE]: 'Skate',
    [BoardType.CRUISER]: 'Cruiser',
    [BoardType.LONG]: 'Long',
  };
  return labels[type] || type;
};

export const formatBoardCondition = (condition: BoardCondition): string => {
  const labels = {
    [BoardCondition.GOOD]: 'Bon état',
    [BoardCondition.AVERAGE]: 'État moyen',
    [BoardCondition.BAD]: 'Mauvais état',
  };
  return labels[condition] || condition;
};
