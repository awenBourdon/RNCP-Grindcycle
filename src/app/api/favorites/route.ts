import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await request.headers });
  if (!session)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { product: true },
  });

  return NextResponse.json({ success: true, data: favorites });
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await request.headers });
  if (!session)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { productId } = await request.json();

  try {
    await prisma.favorite.create({
      data: { userId: session.user.id, productId },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true }); // Déjà en favoris, pas grave
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await request.headers });
  if (!session)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  await prisma.favorite.deleteMany({
    where: { userId: session.user.id, productId: productId! },
  });

  return NextResponse.json({ success: true });
}
