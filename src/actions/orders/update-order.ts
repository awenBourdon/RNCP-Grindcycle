'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { OrderService } from '@/lib/server/orders/orders.service';
import { OrderStatus, UserRole } from '@/lib/utils/enums/enums';

const orderService = new OrderService();

const updateStatusSchema = z.object({
  orderId: z.string(),
  status: z.nativeEnum(OrderStatus),
});

export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session || session.user.role !== UserRole.ADMIN) {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  try {
    const validation = updateStatusSchema.safeParse({ orderId, status });

    if (!validation.success) {
      return {
        success: false,
        error: 'Données invalides',
        details: validation.error.errors.map(err => err.message),
      };
    }

    const order = await orderService.updateOrderStatus(
      validation.data.orderId,
      validation.data.status
    );

    revalidatePath('/admin/commandes');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      data: order,
      message: 'Statut de la commande mis à jour avec succès',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}
