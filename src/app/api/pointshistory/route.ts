import { type NextRequest, NextResponse } from 'next/server';
import { applyGetRateLimit } from '@/lib/rateLimit';
import { auth } from '@/lib/auth';
import { UserService } from '@/lib/server/src/users/users-service';

const userService = new UserService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'generalGet');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const targetUserId = userId || session.user.id;

    if (targetUserId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const pointsHistory = await userService.getUserPointsHistory(targetUserId);

    return NextResponse.json({
      success: true,
      data: pointsHistory,
    });
  } catch (error) {
    console.error('Erreur API points history:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur serveur' 
      },
      { status: 500 }
    );
  }
}