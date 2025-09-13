'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const favoriteSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
});

export async function favoritesAction(productId: string) {
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
        details: validation.error.errors.map(e => e.message),
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

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    let action: 'added' | 'removed';
    let message: string;

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: {
          userId_productId: {
            userId: session.user.id,
            productId,
          },
        },
      });
      action = 'removed';
      message = 'Retiré des favoris';
    } else {
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          productId,
        },
      });
      action = 'added';
      message = 'Ajouté aux favoris';
    }

    revalidatePath('/compte/favoris');
    revalidatePath(`/produit/${productId}`);

    return {
      success: true,
      action,
      message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}
