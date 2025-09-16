import { type NextRequest, NextResponse } from 'next/server';
import { applyGetRateLimit } from '@/lib/rateLimit';
import { auth } from '@/lib/auth';
import { User } from '@/lib/types';
import { UserService } from '@/lib/server/services/users-service';

const userService = new UserService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'generalGet');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    const admin = searchParams.get('admin');

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    if (admin === 'true') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé' },
          { status: 403 }
        );
      }

      const users = await userService.getAllUsers();
      
      const sortedUsers = users.sort((a: User, b: User) => {
        if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
        if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
        return 0;
      });

      return NextResponse.json({
        success: true,
        data: sortedUsers,
      });
    }

    if (userId) {
      if (userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 403 }
        );
      }

      const user = await userService.getUserById(userId);
      return NextResponse.json({
        success: true,
        data: user,
      });
    }

    const user = await userService.getUserById(session.user.id);
    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    );
  }
}