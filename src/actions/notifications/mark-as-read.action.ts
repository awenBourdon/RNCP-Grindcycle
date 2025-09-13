'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { notificationService } from '@/lib/server/services/notificationsService';

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
    await notificationService.markNotificationAsRead(
      notificationId, 
      session.user.id, 
      session.user.role
    );

    revalidatePath('/compte/notifications');
    revalidatePath('/admin/notifications');

    return {
      success: true,
      message: 'Notification marquée comme lue',
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}