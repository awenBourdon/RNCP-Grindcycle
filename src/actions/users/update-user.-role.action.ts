'use server';
import { auth } from '@/lib/utils/auth';
import { UserService } from '@/lib/server/users/users-service';
import { headers } from 'next/headers';
import { z } from 'zod';
import { UserRole } from '@/lib/utils/enums/enums';
import { revalidatePath } from 'next/cache';

const updateRoleSchema = z.object({
  userId: z.string().min(1, 'ID utilisateur requis'),
  newRole: z.enum([UserRole.ADMIN, UserRole.USER]),
});

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole
) {
  const headersList = await headers();
  
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return {
      success: false,
      error: 'Non autorisé - Vous devez être connecté',
    };
  }

  if (session.user.role !== UserRole.ADMIN) {
    return {
      success: false,
      error: 'Non autorisé - Seul un administrateur peut modifier les rôles',
    };
  }

  const validation = updateRoleSchema.safeParse({ userId, newRole });
  
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Données invalides',
    };
  }

  try {
    const userService = new UserService();

    const targetUser = await userService.getUserById(userId);

    if (targetUser.role === UserRole.ADMIN && userId !== session.user.id) {
      return {
        success: false,
        error: 'Un administrateur ne peut pas modifier le rôle d\'un autre administrateur',
      };
    }

    if (userId === session.user.id) {
      return {
        success: false,
        error: 'Vous ne pouvez pas modifier votre propre rôle',
      };
    }

    await userService.updateUserRole(userId, newRole);

    revalidatePath('/admin/utilisateurs');
    revalidatePath('/compte/profil');

    return {
      success: true,
      message: `Rôle de l'utilisateur mis à jour vers ${newRole === UserRole.ADMIN ? 'Administrateur' : 'Utilisateur'}`,
    };
  } catch (err) {
    console.error('Erreur lors de la mise à jour du rôle:', err);

    const errorMessage =
      err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour du rôle';

    return {
      success: false,
      error: errorMessage,
    };
  }
}