'use server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteUserSchema } from '@/lib/validations/authValidation';
import { APIError } from 'better-auth/api';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

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

 if (session.user.role !== 'ADMIN' || session.user.id === userId) {
    throw new Error('Non Authorisé');
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
        role: 'USER',
      },
    });

    if (session.user.id === userId) {
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