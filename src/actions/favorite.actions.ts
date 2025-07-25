'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const favoriteSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
});

export async function addToFavoritesAction(productId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return {
      success: false,
      error: 'Non connecté',
    };
  }

  try {
    const validation = favoriteSchema.safeParse({ productId });
    if (!validation.success) {
      return {
        success: false,
        error: 'ID produit invalide',
      };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return {
        success: false,
        error: 'Produit non trouvé',
      };
    }

    await prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        productId,
      },
    });

    revalidatePath('/compte/favoris');
    revalidatePath(`/produit/${productId}`);

    return {
      success: true,
      message: 'Ajouté aux favoris',
    };
  } catch (error) {
    console.error('Erreur ajout favoris:', error);
    return {
      success: false,
      error: 'Erreur serveur',
    };
  }
}

export async function removeFromFavoritesAction(productId: string) {
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    return {
      success: false,
      error: 'Non connecté',
    };
  }

  try {
    const validation = favoriteSchema.safeParse({ productId });
    if (!validation.success) {
      return {
        success: false,
        error: 'ID produit invalide',
      };
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    revalidatePath('/compte/favoris');
    revalidatePath(`/produit/${productId}`);

    return {
      success: true,
      message: 'Retiré des favoris',
    };
  } catch (error) {
    console.error('Erreur suppression favoris:', error);
    return {
      success: false,
      error: 'Erreur serveur',
    };
  }
}
