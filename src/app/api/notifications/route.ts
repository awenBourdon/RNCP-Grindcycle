import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const target = searchParams.get('target');

  try {
    let notifications;

    if (target === 'admin') {
      notifications = await prisma.notification.findMany({
        where: {
          target: 'ADMIN',
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
    } else if (userId) {
      notifications = await prisma.notification.findMany({
        where: {
          userId: userId,
          target: 'USER',
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } else {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des notifications' 
      },
      { status: 500 }
    );
  }
}