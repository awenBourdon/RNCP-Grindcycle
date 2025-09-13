'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notificationService } from '@/lib/server/services/notificationsService';

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
    const result = await notificationService.markAllNotificationsAsRead(
      userId, 
      session.user.id, 
      session.user.role
    );

    revalidatePath('/compte/notifications');

    return {
      success: true,
      message: result.message,
      count: result.count,
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}