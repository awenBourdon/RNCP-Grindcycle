import { type NextRequest } from 'next/server';
import { UsedBoardService } from '@/lib/server/services/usedBoardService';
import { ResponseHelper } from '@/lib/server/utils/responseHelper';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { applyGetRateLimit } from '@/lib/rateLimit';

const usedBoardService = new UsedBoardService();

export async function GET(req: NextRequest) {
  const rateLimitResponse = applyGetRateLimit(req, 'getUsedBoards');
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const { searchParams } = new URL(req.url);
  const boardId = searchParams.get('id');
  const userId = searchParams.get('userId');

  try {
    if (boardId) {
      const board = await usedBoardService.getUsedBoardById(boardId);
      return ResponseHelper.success(board);
    }

    if (userId) {
      const boards = await usedBoardService.getUserUsedBoards(userId);
      return ResponseHelper.success(boards);
    }

    const boards = await usedBoardService.getAllUsedBoards();
    return ResponseHelper.success(boards);

  } catch (error) {
    if (error instanceof Error && error.message === API_MESSAGES.USED_BOARD_NOT_FOUND) {
      return ResponseHelper.notFound(error.message);
    }
    
    return ResponseHelper.error(
      error instanceof Error ? error.message : 'Erreur serveur'
    );
  }
}