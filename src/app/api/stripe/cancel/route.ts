import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.log('Commande non trouvée:', orderId);
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      );
    }

    if (order.status === 'CONFIRMED' || order.status === 'SHIPPED' || order.status === 'DELIVERED') {
      return NextResponse.json(
        { error: 'Cette commande ne peut plus être annulée' },
        { status: 400 }
      );
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      order: cancelledOrder,
    });

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