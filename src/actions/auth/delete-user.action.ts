'use server';
import { auth } from '@/lib/utils/auth';
import { UserService } from '@/lib/server/users/users-service';
import { deleteUserSchema } from '@/lib/validations/auth.validation';
import { APIError } from 'better-auth/api';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function deleteUserAction({ userId }: { userId: string }) {
  const headersList = await headers();
  const validation = deleteUserSchema.safeParse({ userId });
  
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Données invalides',
    };
  }
  
  const session = await auth.api.getSession({
    headers: headersList,
  });
  
  if (!session) {
    return { success: false, error: 'Non autorisé' };
  }
  
  const isOwnAccount = session.user.id === userId;
  const isAdmin = session.user.role === 'ADMIN';
  
  if (!isOwnAccount && !isAdmin) {
    return {
      success: false,
      error: 'Non autorisé - Vous ne pouvez supprimer que votre propre compte'
    };
  }
  
  if (!isOwnAccount) {
    const userService = new UserService();
    
    try {
      const targetUser = await userService.getUserById(userId);
      
      if (targetUser.role === 'ADMIN') {
        return {
          success: false,
          error: 'Un administrateur ne peut pas supprimer un autre administrateur'
        };
      }
    } catch {
      return { success: false, error: 'Utilisateur non trouvé' };
    }
  }
  
  try {
    const userService = new UserService();
    await userService.deleteUser(userId);
    
    if (isOwnAccount) {
      await auth.api.signOut({ headers: headersList });
      return {
        success: true,
        error: null,
        shouldRedirect: true
      };
    }
    
    revalidatePath('/dashboard/admin');
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }
    
    return { success: false, error: 'Erreur lors de la suppression du compte' };
  }
}