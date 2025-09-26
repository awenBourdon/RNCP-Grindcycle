import { NextResponse } from 'next/server';
import { OrderService } from '@/server/orders/orders.service';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    console.log('Annulation de commande:', orderId);

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID requis' },
        { status: 400 }
      );
    }

    const orderService = new OrderService();

    try {
      const order = await orderService.getOrderById(orderId);

      if (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
        return NextResponse.json(
          { error: 'Cette commande ne peut plus être annulée' },
          { status: 400 }
        );
      }

      const cancelledOrder = await orderService.updateOrderStatus(orderId, 'CANCELLED');

      return NextResponse.json({
        success: true,
        order: cancelledOrder,
      });

    } catch (serviceError) {
      if (serviceError instanceof Error && serviceError.message === 'Commande non trouvée') {
        return NextResponse.json(
          { error: 'Commande non trouvée' },
          { status: 404 }
        );
      }
      throw serviceError;
    }

  } catch (error) {
    console.error('Erreur annulation commande:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Erreur lors de l'annulation: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur inconnue lors de l\'annulation de la commande' },
      { status: 500 }
    );
  }
}