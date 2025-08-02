import { type NextRequest } from 'next/server';
import { UsedBoardController } from '@/lib/server/controllers/usedBoardController';
import { applyGetRateLimit } from '@/lib/rateLimit';

const controller = new UsedBoardController();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getUsedBoards');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (boardId) {
    return controller.getById(boardId);
  }

  if (userId) {
    return controller.getUserBoards(userId);
  }

  return controller.getAll();
}