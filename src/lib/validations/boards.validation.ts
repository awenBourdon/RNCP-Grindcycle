import { BoardCondition, BoardType } from '@/generated/prisma';
import { z } from 'zod';
import { UPLOAD_CONFIG, isAllowedMimeType } from '@/lib/server/upload-images/upload';

const imageFileSchema = z
  .instanceof(File)
  .refine(
    file => file.size <= UPLOAD_CONFIG.maxFileSize,
    `Taille max: ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`
  )
  .refine(
    file => isAllowedMimeType(file.type),
    `Formats acceptés: JPG, PNG, WebP`
  );

const baseImageSchema = z
  .array(imageFileSchema)
  .min(1, 'Au moins 1 photo requise')
  .max(3, 'Maximum 3 photos');

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
  images: baseImageSchema,
});

export const productSchema = recycleSchema
  .omit({ userId: true, boardCondition: true, description: true })
  .extend({
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