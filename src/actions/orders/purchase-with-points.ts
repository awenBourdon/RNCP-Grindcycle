'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { BoardType } from '@/generated/prisma';
import { z } from 'zod';
import { OrderService } from '@/lib/server/services/orders.service';

const purchaseSchema = z.object({
  cartItems: z.array(z.object({
    productId: z.string().min(1),
    name: z.string().min(1),
    type: z.nativeEnum(BoardType),
    priceEuro: z.number().min(0),
    pricePoints: z.number().min(1),
    quantity: z.number().min(1),
  })).min(1, 'Le panier ne peut pas être vide'),
  shippingAddress: z.object({
    address: z.string().min(1, 'Adresse requise'),
    city: z.string().min(1, 'Ville requise'),
    postalCode: z.string().min(1, 'Code postal requis'),
    country: z.string().min(1, 'Pays requis'),
    phone: z.string().optional(),
  }).optional(),
});

const orderService = new OrderService();

export async function purchaseWithPointsAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return {
      success: false,
      error: 'Vous devez être connecté pour passer une commande',
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
    console.error('Erreur achat avec points:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur lors de la commande',
    };
  }
}