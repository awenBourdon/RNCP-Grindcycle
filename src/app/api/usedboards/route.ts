import { type NextRequest, NextResponse } from 'next/server';
import { applyGetRateLimit } from '@/lib/utils/rateLimit';
import { auth } from '@/lib/utils/auth';
import { UsedBoardService } from '@/lib/server/used-boards/used-boards.service';
import { extractPaginationFromSearchParams } from '@/lib/utils/pagination';
import { UserRole } from '@/lib/utils/enums/enums';

const usedBoardService = new UsedBoardService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getUsedBoards');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const admin = searchParams.get('admin');
    const available = searchParams.get('available');
    const page = searchParams.get('page');

    const session = await auth.api.getSession({ headers: req.headers });

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

      if (available === 'true') {
        const boards = await usedBoardService.getAvailableUsedBoards();
        return NextResponse.json({ success: true, data: boards });
      }

      if (page) {
        const { page: currentPage, limit } = extractPaginationFromSearchParams(searchParams);
        const result = await usedBoardService.getAllUsedBoardsWithPagination({ page: currentPage, limit });
        return NextResponse.json(result, { status: 200 });
      }

      const boards = await usedBoardService.getAllUsedBoards();
      return NextResponse.json({ success: true, data: boards });
    }

    if (boardId) {
      const board = await usedBoardService.getUsedBoardById(boardId);
      
      if (board.user?.id !== session.user.id && session.user.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { success: false, error: 'Non autorisé' },
          { status: 403 }
        );
      }

      return NextResponse.json({ success: true, data: board });
    }

    const targetUserId = userId || session.user.id;

    if (targetUserId !== session.user.id && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 403 }
      );
    }

    if (page) {
      const { page: currentPage, limit } = extractPaginationFromSearchParams(searchParams);
      const result = await usedBoardService.getUserUsedBoardsWithPagination(targetUserId, { page: currentPage, limit });
      return NextResponse.json(result, { status: 200 });
    }

    const boards = await usedBoardService.getUserUsedBoards(targetUserId);
    return NextResponse.json({ success: true, data: boards });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}