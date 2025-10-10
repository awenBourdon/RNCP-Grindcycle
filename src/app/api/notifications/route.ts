import { NextRequest, NextResponse } from 'next/server';
import { applyGetRateLimit } from '@/lib/utils/rateLimit';
import { auth } from '@/lib/utils/auth';
import { NotificationService } from '@/lib/server/notifications/notifications.service';
import { extractPaginationFromSearchParams } from '@/lib/utils/pagination';
import { UserRole } from '@/lib/utils/enums/enums';

export async function GET(request: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(request, 'getNotifications');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const page = searchParams.get('page');
   
    const notificationService = new NotificationService();

    if (type === 'admin') {
      if (session.user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        );
      }

      if (page) {
        const { page: currentPage, limit } = extractPaginationFromSearchParams(searchParams);
        const result = await notificationService.getAdminNotificationsWithPagination({ page: currentPage, limit });
        return NextResponse.json(result, { status: 200 });
      }

      const notifications = await notificationService.getAdminNotifications();
      return NextResponse.json({ success: true, data: notifications });
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Paramètre userId manquant' },
        { status: 400 }
      );
    }

    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    if (page) {
      const { page: currentPage, limit } = extractPaginationFromSearchParams(searchParams);
      const result = await notificationService.getUserNotificationsWithPagination(userId, { page: currentPage, limit });
      return NextResponse.json(result, { status: 200 });
    }

    const notifications = await notificationService.getUserNotifications(userId);
    return NextResponse.json({ success: true, data: notifications });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}