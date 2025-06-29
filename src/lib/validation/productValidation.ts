import { z } from 'zod';

enum ProductType {
  SKATE = 'SKATE',
  CRUISER = 'CRUISER',
  LONG = 'LONG',
}

export const productSchema = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  description: z.string().optional(),
  type: z.enum([ProductType.SKATE, ProductType.CRUISER, ProductType.LONG], {
    errorMap: () => ({ message: "Type de planche invalide" }),
  }),
  priceEuro: z.number().min(0, "Le prix en euros doit être positif"),
  pricePoints: z.number().min(0, "Le prix en points doit être positif"),
  usedBoardId: z.string().min(1, "L'ID de la planche d'occasion est requis"),
});

export type ProductInput = z.infer<typeof productSchema>;
