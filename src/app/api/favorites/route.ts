import { type NextRequest, NextResponse } from 'next/server';
import { applyGetRateLimit } from '@/lib/utils/rateLimit';
import { auth } from '@/lib/utils/auth';
import { FavoriteService } from '@/lib/server/favorites/favorites.service';
import { extractPaginationFromSearchParams } from '@/lib/utils/pagination';
import { UserRole } from '@/lib/utils/enums/enums';

const favoriteService = new FavoriteService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getFavorites');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (productId) {
      const targetUserId = userId || session.user.id;
     
      if (targetUserId !== session.user.id && session.user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 403 }
        );
      }

      const isFavorite = await favoriteService.isFavorite(targetUserId, productId);
      return NextResponse.json({
        success: true,
        data: { isFavorite },
      });
    }

    const targetUserId = userId || session.user.id;
   
    if (targetUserId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { page, limit } = extractPaginationFromSearchParams(searchParams);
    const result = await favoriteService.getUserFavorites(targetUserId, { page, limit });
    
    // ✅ CORRECTION : Ajouter success: true dans la réponse
    return NextResponse.json(
      {
        success: true,
        ...result
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}