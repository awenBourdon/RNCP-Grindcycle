'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const markAsReadSchema = z.object({
  notificationId: z.string().min(1, 'ID notification requis'),
});

export async function markNotificationAsReadAction(notificationId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return {
      success: false,
      error: 'Non connecté',
    };
  }

  try {
    const validation = markAsReadSchema.safeParse({ notificationId });
    if (!validation.success) {
      return {
        success: false,
        error: 'ID notification invalide',
        details: validation.error.errors.map(e => e.message),
      };
    }

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return {
        success: false,
        error: 'Notification non trouvée',
      };
    }

    if (notification.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Non autorisé',
      };
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    revalidatePath('/compte/notifications');
    revalidatePath('/admin/notifications');

    return {
      success: true,
      message: 'Notification marquée comme lue',
    };
  } catch (error) {
    console.error('Erreur marquer notification comme lue:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}