import { type NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/server/services/orders.service';
import { applyGetRateLimit } from '@/lib/rateLimit';
import { auth } from '@/lib/auth';

const orderService = new OrderService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getOrders');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const admin = searchParams.get('admin');

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (admin === 'true') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé' },
          { status: 403 }
        );
      }

      console.log('🔍 Récupération de toutes les commandes pour admin...');
      const orders = await orderService.getAllOrders();
      console.log('📦 Nombre de commandes récupérées:', orders.length);

      return NextResponse.json({
        success: true,
        data: orders,
      });
    }

    if (orderId) {
      const order = await orderService.getOrderById(orderId);
      
      if (order.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        success: true,
        data: order,
      });
    }

    if (userId) {
      if (userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 403 }
        );
      }

      const orders = await orderService.getUserOrders(userId);
      return NextResponse.json({
        success: true,
        data: orders,
      });
    }

    const orders = await orderService.getUserOrders(session.user.id);
    return NextResponse.json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error('Erreur dans GET /api/orders:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}