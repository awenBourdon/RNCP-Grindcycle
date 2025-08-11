import { NextResponse } from 'next/server';
import { BaseController } from './baseController';
import { UsedBoardService } from '@/lib/server/services/usedBoardService';
import { ResponseHelper } from '@/lib/server/utils/responseHelper';
import { API_MESSAGES } from '@/lib/server/config/constants';
export class UsedBoardController extends BaseController {
  constructor(
    private usedBoardService: UsedBoardService = new UsedBoardService()
  ) {
    super();
  }

  async getById(boardId: string): Promise<NextResponse> {
    try {
      const board = await this.usedBoardService.getUsedBoardById(boardId);
      return ResponseHelper.success(board);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === API_MESSAGES.USED_BOARD_NOT_FOUND
      ) {
        return ResponseHelper.notFound(error.message);
      }

      return this.handleError(error);
    }
  }

  async getAll(): Promise<NextResponse> {
    try {
      const boards = await this.usedBoardService.getAllUsedBoards();
      return ResponseHelper.success(boards);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserBoards(userId: string): Promise<NextResponse> {
    try {
      const boards = await this.usedBoardService.getUserUsedBoards(userId);
      return ResponseHelper.success(boards);
    } catch (error) {
      return this.handleError(error);
    }
  }
}
