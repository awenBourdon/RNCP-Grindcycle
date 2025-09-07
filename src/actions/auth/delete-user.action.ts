'use server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteUserSchema } from '@/lib/validations/authValidation';
import { APIError } from 'better-auth/api';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserService } from '@/lib/server/services/userService';

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
  
  if (!session) throw new Error('Non authorisé');
  
  const isOwnAccount = session.user.id === userId;
  const isAdmin = session.user.role === 'ADMIN';
  
if (!isOwnAccount && !isAdmin) {
    throw new Error('Non autorisé - Vous ne pouvez supprimer que votre propre compte');
  }
  
 if (!isOwnAccount) {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    if (!targetUser) {
      return { success: false, error: 'Utilisateur non trouvé' };
    }
    
    if (targetUser.role === 'ADMIN') {
      throw new Error('Un administrateur ne peut pas supprimer un autre administrateur');
    }
  }
  
  try {
    const userService = new UserService();
    await userService.deleteUser(userId);
    
    if (isOwnAccount) {
      await auth.api.signOut({ headers: headersList });
      redirect('/authentification/connexion');
    }
    
    revalidatePath('/dashboard/admin');
    return { success: true, error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'Erreur serveur' };
  }
}
