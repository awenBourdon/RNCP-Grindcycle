'use server';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { PaymentService } from '@/lib/server/payments/payments.service';
import { MailService } from '@/lib/server/mail/mail.service';

const paymentService = new PaymentService();

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

    if (!cartItemsJson) {
      return {
        success: false,
        error: 'Données du panier manquantes',
      };
    }

    let cartItems, shippingAddress;
   
    try {
      cartItems = JSON.parse(cartItemsJson);
      shippingAddress = shippingAddressJson ? JSON.parse(shippingAddressJson) : undefined;
    } catch {
      return {
        success: false,
        error: 'Format de données invalide',
      };
    }

    const order = await paymentService.processPointsPayment({
      userId: session.user.id,
      cartItems,
      shippingAddress,
    });

    revalidatePath('/compte/commandes');
    revalidatePath('/compte/profil');
    revalidatePath('/catalogue');
    revalidatePath('/admin/commandes');

    if (session.user?.email) {
      const mailService = new MailService();
      await mailService.sendOrderConfirmationEmail(session.user.email, order, null); 
    }

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