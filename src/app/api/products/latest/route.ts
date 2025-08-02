import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@/generated/prisma';
import { applyGetRateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(request, 'getProducts');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 10);

    const products = await prisma.product.findMany({
      where: {
        status: ProductStatus.CATALOG,
      },
      include: {
        usedBoard: {
          select: {
            id: true,
            name: true,
            boardType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des derniers produits:',
      error
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur',
      },
      { status: 500 }
    );
  }
}