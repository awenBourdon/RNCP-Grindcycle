import { z } from 'zod';
import { BoardType } from '@/generated/prisma';

export const SHIPPING_CONFIG = {
  countries: ['France', 'Belgique', 'Suisse', 'Luxembourg'] as const,
  postalCodePatterns: {
    France: /^[0-9]{5}$/,
    Belgique: /^[0-9]{4}$/,
    Suisse: /^[0-9]{4}$/,
    Luxembourg: /^[0-9]{4}$/,
  },
  phonePattern: /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
} as const;

const nameSchema = z
  .string()
  .min(1, 'Ce champ est requis')
  .max(50, 'Maximum 50 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Caractères non valides');

const emailSchema = z
  .string()
  .min(1, 'Email requis')
  .email('Format email invalide');

const phoneSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || SHIPPING_CONFIG.phonePattern.test(value),
    'Format de téléphone invalide'
  );

const addressSchema = z
  .string()
  .min(1, 'Adresse requise')
  .max(100, 'Maximum 100 caractères');

const citySchema = z
  .string()
  .min(1, 'Ville requise')
  .max(50, 'Maximum 50 caractères')
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Caractères non valides');

const countrySchema = z.enum(SHIPPING_CONFIG.countries, {
  errorMap: () => ({ message: 'Pays non supporté' }),
});

const postalCodeSchema = z
  .string()
  .min(1, 'Code postal requis');

export const pointsShippingSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  address: addressSchema,
  city: citySchema,
  postalCode: postalCodeSchema,
  country: countrySchema,
  email: emailSchema,
  phone: phoneSchema,
}).refine(
  (data) => {
    const pattern = SHIPPING_CONFIG.postalCodePatterns[data.country];
    return pattern.test(data.postalCode);
  },
  {
    message: 'Format de code postal invalide pour ce pays',
    path: ['postalCode'],
  }
);

export const cartItemSchema = z.object({
  id: z.string().uuid('ID invalide').optional(),
  productId: z.string().uuid('ID produit invalide').optional(),
  name: z.string().min(1, 'Nom requis'),
  type: z.nativeEnum(BoardType, { message: 'Type de planche invalide' }),
  priceEuro: z.number().min(0, 'Prix invalide'),
  pricePoints: z.number().min(0, 'Points invalides'),
  imageUrl: z.array(z.string()).optional(),
})
.refine((data) => data.id || data.productId, {
  message: "Soit 'id' soit 'productId' doit être fourni",
})
.transform((data) => ({
  ...data,
  productId: data.productId || data.id!,
  id: data.id || data.productId!,
}));

export const pointsPurchaseSchema = z.object({
  cartItems: z
    .array(cartItemSchema)
    .min(1, 'Panier vide')
    .max(10, 'Maximum 10 articles'),
  shippingAddress: pointsShippingSchema,
  totalPoints: z.number().min(1, 'Total invalide'),
  userPoints: z.number().min(0, 'Points utilisateur invalides'),
}).refine(
  (data) => data.userPoints >= data.totalPoints,
  {
    message: 'Points insuffisants',
    path: ['totalPoints'],
  }
);

export type PointsShippingInput = z.infer<typeof pointsShippingSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type PointsPurchaseInput = z.infer<typeof pointsPurchaseSchema>;

export const VALIDATION_MESSAGES = {
  required: 'Ce champ est requis',
  invalidEmail: 'Format email invalide',
  invalidPhone: 'Format de téléphone invalide',
  invalidPostalCode: 'Code postal invalide pour ce pays',
  insufficientPoints: 'Points insuffisants pour cette commande',
  emptyCart: 'Le panier est vide',
} as const;