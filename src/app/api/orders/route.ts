import { type NextRequest, NextResponse } from 'next/server';
import { applyGetRateLimit } from '@/lib/utils/rateLimit';
import { auth } from '@/lib/utils/auth';
import { OrderService } from '@/lib/server/orders/orders.service';
import { extractPaginationFromSearchParams } from '@/lib/utils/pagination';
import { UserRole } from '@/lib/utils/enums/enums';

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
    const page = searchParams.get('page');

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (orderId) {
      const order = await orderService.getOrderById(orderId);
      
      if (order.userId !== session.user.id && session.user.role !== UserRole.ADMIN) {
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

    if (admin === 'true') {
      if (session.user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé' },
          { status: 403 }
        );
      }

      if (page) {
        const { page: currentPage, limit } = extractPaginationFromSearchParams(searchParams);
        const result = await orderService.getAllOrdersWithPagination({ page: currentPage, limit });
        return NextResponse.json(result, { status: 200 });
      }

      const orders = await orderService.getAllOrders();
      return NextResponse.json({
        success: true,
        data: orders,
      });
    }

    const targetUserId = userId || session.user.id;
   
    if (targetUserId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 403 }
      );
    }

    if (page) {
      const { page: currentPage, limit } = extractPaginationFromSearchParams(searchParams);
      const result = await orderService.getUserOrdersWithPagination(targetUserId, { page: currentPage, limit });
      return NextResponse.json(result, { status: 200 });
    }

    const orders = await orderService.getUserOrders(targetUserId);
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