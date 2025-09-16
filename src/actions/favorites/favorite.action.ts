'use server';
import { revalidatePath } from 'next/cache';
import { FavoriteService } from '@/lib/server/services/favorites.service';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { z } from 'zod';

const favoriteSchema = z.object({
  productId: z.string().min(1, 'ID produit requis'),
});

const favoriteService = new FavoriteService();

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

    const result = await favoriteService.toggleFavorite(session.user.id, productId);

    revalidatePath('/compte/favoris');
    revalidatePath(`/produit/${productId}`);
    
    return {
      success: true,
      action: result.action,
      message: result.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur serveur',
    };
  }
}