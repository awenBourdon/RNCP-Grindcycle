import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { applyGetRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(request, 'getFavorites');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const session = await auth.api.getSession({ headers: await request.headers });
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { 
        product: {
          include: {
            usedBoard: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        } 
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      success: true, 
      data: favorites 
    });
  } catch (error) {
    console.error('Erreur récupération favoris:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des favoris' 
      },
      { status: 500 }
    );
  }
}