'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const markAllAsReadSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur requis'),
});

export async function markAllNotificationsAsReadAction(userId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return {
      success: false,
      error: 'Non connecté',
    };
  }

  try {
    const validation = markAllAsReadSchema.safeParse({ userId });
    if (!validation.success) {
      return {
        success: false,
        error: 'ID utilisateur invalide',
        details: validation.error.errors.map(e => e.message),
      };
    }

    if (userId !== session.user.id && session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Non autorisé',
      };
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
        target: 'USER',
      },
      data: { isRead: true },
    });

    revalidatePath('/compte/notifications');

    return {
      success: true,
      message: `${result.count} notifications marquées comme lues`,
    };
  } catch (error) {
    console.error('Erreur marquer toutes notifications comme lues:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}