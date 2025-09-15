import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applyGetRateLimit } from '@/lib/rateLimit';
import { auth } from '@/lib/auth';

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

    if (type === 'admin') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 403 }
        );
      }

      const notifications = await prisma.notification.findMany({
        where: { 
          target: 'ADMIN' 
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

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

    const notifications = await prisma.notification.findMany({
      where: { userId, target: 'USER' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: notifications });

  } catch (error) {
    console.error( error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}