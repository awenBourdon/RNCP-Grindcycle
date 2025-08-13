'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { BoardType } from '@/generated/prisma';
import { z } from 'zod';
import { OrderService } from '@/lib/server/services/orders.service';
import { pointsShippingSchema } from '@/lib/validations/shippingValidation';

const serverCartItemSchema = z.object({
  productId: z.string().uuid('ID produit invalide'),
  name: z.string().min(1, 'Nom requis'),
  type: z.nativeEnum(BoardType, { message: 'Type de planche invalide' }),
  priceEuro: z.number().min(0, 'Prix invalide'),
  pricePoints: z.number().min(0, 'Points invalides'),
  quantity: z.number().int().min(1, 'Quantité minimum 1'),
});

const purchaseSchema = z.object({
  cartItems: z
    .array(serverCartItemSchema)
    .min(1, 'Le panier ne peut pas être vide'),
  shippingAddress: pointsShippingSchema,
});

const orderService = new OrderService();

export async function purchaseWithPointsAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });
  
  if (!session) {
    return {
      success: false,
      error: 'Tu dois être connecté pour passer une commande',
    };
  }

  try {
    const cartItemsJson = formData.get('cartItems') as string;
    const shippingAddressJson = formData.get('shippingAddress') as string;

    let cartItems, shippingAddress;
    
    try {
      cartItems = JSON.parse(cartItemsJson);
      shippingAddress = shippingAddressJson ? JSON.parse(shippingAddressJson) : undefined;
    } catch {
      return {
        success: false,
        error: 'Données invalides',
      };
    }

    const validation = purchaseSchema.safeParse({
      cartItems,
      shippingAddress,
    });

    if (!validation.success) {
      return {
        success: false,
        error: 'Données de commande invalides',
        details: validation.error.errors.map(e => e.message),
      };
    }

    const order = await orderService.purchaseWithPoints({
      userId: session.user.id,
      cartItems: validation.data.cartItems,
      shippingAddress: validation.data.shippingAddress,
    });

    revalidatePath('/compte/commandes');
    revalidatePath('/compte/profil');
    revalidatePath('/catalogue');
    revalidatePath('/admin/commandes');

    return {
      success: true,
      data: {
        orderId: order.id,
        pointsUsed: order.pointsUsed,
        itemCount: order.orderItems.length,
      },
      message: `Commande confirmée ! ${order.pointsUsed} points utilisés.`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la commande',
    };
  }
}