
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID est nécessaire' }, { status: 400 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        target: 'USER'
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { notificationId, isRead } = await request.json();

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification ID es nécessaire' }, { status: 400 });
  }

  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead },
    });
    return NextResponse.json(notification);
  } catch {
    return NextResponse.json({ error: 'Erreur lors de la modification de la notificationn' }, { status: 500 });
  }
}
