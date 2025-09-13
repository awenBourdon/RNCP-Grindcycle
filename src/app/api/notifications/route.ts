import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { applyGetRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(request, 'getNotifications');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'Paramètre userId manquant' },
      { status: 400 }
    );
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId, target: 'USER' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: notifications });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}
