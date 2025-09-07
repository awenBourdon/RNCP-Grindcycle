'use server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { z } from 'zod';

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
    if (email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return {
          success: false,
          error: 'Cette adresse email est déjà utilisée',
        };
      }
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email,
      },
    });

    return {
      success: true,
      message: 'Profil mis à jour avec succès',
    };
  } catch {
    console.error('Erreur lors de la mise à jour du profil');
    return {
      success: false,
      error: 'Une erreur est survenue lors de la mise à jour',
    };
  }
}