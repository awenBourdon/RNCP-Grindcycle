import { z } from 'zod';

enum BoardType {
  SKATE = 'SKATE',
  CRUISER = 'CRUISER', 
  LONG = 'LONG',
}

enum BoardCondition {
  GOOD = 'GOOD',
  AVERAGE = 'AVERAGE',
  BAD = 'BAD',
}

const imageFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= 5 * 1024 * 1024, {
    message: "La taille de l'image ne doit pas dépasser 5MB",
  })
  .refine(
    (file) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type),
    {
      message: "Format d'image non supporté. Utilise JPG, PNG ou WebP",
    }
  );

export const recycleFormSchema = z.object({
  userId: z.string().min(1, "L'ID utilisateur est requis"),
  name: z.string().min(1, "Le nom de la planche est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  boardType: z.enum([BoardType.SKATE, BoardType.CRUISER, BoardType.LONG], {
    errorMap: () => ({ message: "Type de planche invalide" }),
  }),
  boardCondition: z.enum([BoardCondition.GOOD, BoardCondition.AVERAGE, BoardCondition.BAD], {
    errorMap: () => ({ message: "État de la planche invalide" }),
  }),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),

  images: z
    .array(imageFileSchema)
    .min(1, "Au moins une photo est requise")
    .max(3, "Maximum 3 photos autorisées")
    .refine(
      (images) => images.length > 0,
      {
        message: "La photo principale est obligatoire",
      }
    ),
});

export type RecycleFormInput = z.infer<typeof recycleFormSchema>;

export const formatBoardType = (type: BoardType): string => {
  switch (type) {
    case BoardType.SKATE:
      return 'Skate';
    case BoardType.CRUISER:
      return 'Cruiser';
    case BoardType.LONG:
      return 'Long';
    default:
      return type;
  }
};

export const formatBoardCondition = (condition: BoardCondition): string => {
  switch (condition) {
    case BoardCondition.GOOD:
      return 'Bon état';
    case BoardCondition.AVERAGE:
      return 'État moyen';
    case BoardCondition.BAD:
      return 'Mauvais état';
    default:
      return condition;
  }
};

export const IMAGE_CONFIG = {
  maxSize: 5 * 1024 * 1024,
  maxFiles: 3,
  acceptedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  acceptedFormatsDisplay: 'JPG, PNG, WebP',
} as const;