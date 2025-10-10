import { type NextRequest, NextResponse } from 'next/server';
import { applyGetRateLimit } from '@/lib/utils/rateLimit';
import { auth } from '@/lib/utils/auth';
import { UserService } from '@/lib/server/users/users-service';
import { extractPaginationFromSearchParams } from '@/lib/utils/pagination';
import { UserRole } from '@/lib/utils/enums/enums';


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
    const page = searchParams.get('page');

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
      if (session.user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé' },
          { status: 403 }
        );
      }

      if (page) {
        const { page: currentPage, limit } = extractPaginationFromSearchParams(searchParams);
        const result = await userService.getAllUsersWithPagination({ page: currentPage, limit });
        return NextResponse.json(result, { status: 200 });
      }

      const users = await userService.getAllUsers();
      return NextResponse.json({
        success: true,
        data: users,
      });
    }

    if (userId) {
      if (userId !== session.user.id && session.user.role !== UserRole.ADMIN) {
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
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur serveur' 
      },
      { status: 500 }
    );
  }
}