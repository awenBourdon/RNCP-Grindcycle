import { type NextRequest, NextResponse } from 'next/server';
import { applyGetRateLimit } from '@/lib/utils/rateLimit';
import { auth } from '@/lib/utils/auth';
import { UsedBoardService } from '@/lib/server/used-boards/used-boards.service';

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

    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 });
    }

    if (admin === 'true') {
      if (session.user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Accès non autorisé' }, { status: 403 });
      }

      const boards = available === 'true'
        ? await usedBoardService.getAvailableUsedBoards()
        : await usedBoardService.getAllUsedBoards();

      return NextResponse.json({ success: true, data: boards });
    }

    if (boardId) {
      const board = await usedBoardService.getUsedBoardById(boardId);
      if (board.user?.id !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
      }
      return NextResponse.json({ success: true, data: board });
    }

    if (userId) {
      if (userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
      }
      const boards = await usedBoardService.getUserUsedBoards(userId);
      return NextResponse.json({ success: true, data: boards });
    }

    const boards = await usedBoardService.getUserUsedBoards(session.user.id);
    return NextResponse.json({ success: true, data: boards });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
