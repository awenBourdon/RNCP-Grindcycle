'use server';
import { auth } from '@/lib/utils/auth';
import { headers } from 'next/headers';
import { z } from 'zod';
import { UserService } from '@/server/users/users-service';

const updateProfileSchema = z.object({
  name: z.string().min(1, "Le nom d'utilisateur est requis").max(100, "Maximum 100 caractères"),
  email: z.string().email("Format d'email invalide"),
});

export async function updateProfileAction(formData: FormData) {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return {
      success: false,
      error: 'Non autorisé',
    };
  }

  const rawData = {
    name: String(formData.get('name')),
    email: String(formData.get('email')),
  };

  const validation = updateProfileSchema.safeParse(rawData);

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Données invalides',
    };
  }

  const { name, email } = validation.data;

  try {
    const userService = new UserService();
    
    await userService.updateUserProfile(session.user.id, {
      name,
      email,
    });

    return {
      success: true,
      message: 'Profil mis à jour avec succès',
    };
  } catch (err) {
    console.error('Erreur lors de la mise à jour du profil:', err);
    
    const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour';
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}