import { type NextRequest, NextResponse } from 'next/server';
import { BaseController } from './baseController';
import { UsedBoardService } from '@/lib/server/services/usedBoardService';
import { ResponseHelper } from '@/lib/server/utils/responseHelper';
import { API_MESSAGES } from '@/lib/server/config/constants';
import { ZodHelper } from '@/lib/server/utils/zodHelper';
import { recycleSchema } from '@/lib/validations/boardsValidation';
import { z } from 'zod';
import { UsedBoardStatus } from '@/generated/prisma';

const updateSchema = z.object({
  boardId: z.string(),
  status: z.nativeEnum(UsedBoardStatus).optional(),
  pointsAwarded: z.number().optional(),
});

export class UsedBoardController extends BaseController {
  constructor(
    private usedBoardService: UsedBoardService = new UsedBoardService()
  ) {
    super();
  }

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      const formData = await this.extractFormData(req);

      const validation = ZodHelper.validateFormData(recycleSchema, formData);
      if (!validation.isValid) {
        return ResponseHelper.validationError(validation.errors);
      }

      const images = formData.getAll('image') as File[];
      const board = await this.usedBoardService.createUsedBoard(
        validation.data!,
        images
      );

      return ResponseHelper.created(board, API_MESSAGES.USED_BOARD_CREATED);
    } catch (error) {
      return this.handleError(error, 'UsedBoardController.create');
    }
  }

  async update(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await this.extractJsonData(req);

      const validation = ZodHelper.validate(updateSchema, body);
      if (!validation.isValid) {
        return ResponseHelper.validationError(validation.errors);
      }

      const { boardId, ...updateData } = validation.data!;
      const result = await this.usedBoardService.updateUsedBoard(
        boardId,
        updateData
      );

      return ResponseHelper.success(result, API_MESSAGES.USED_BOARD_UPDATED);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === API_MESSAGES.USED_BOARD_NOT_FOUND
      ) {
        return ResponseHelper.notFound(error.message);
      }

      return this.handleError(error, 'UsedBoardController.update');
    }
  }

  async delete(boardId: string): Promise<NextResponse> {
    try {
      const boardIdSchema = z.string().min(1, 'ID planche requis');
      const validation = ZodHelper.validate(boardIdSchema, boardId);

      if (!validation.isValid) {
        return ResponseHelper.validationError(validation.errors);
      }

      await this.usedBoardService.deleteUsedBoard(validation.data!);
      return ResponseHelper.successMessage(API_MESSAGES.USED_BOARD_DELETED);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === API_MESSAGES.USED_BOARD_NOT_FOUND
      ) {
        return ResponseHelper.notFound(error.message);
      }

      return this.handleError(error, 'UsedBoardController.delete');
    }
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

      return this.handleError(error, 'UsedBoardController.getById');
    }
  }

  async getAll(): Promise<NextResponse> {
    try {
      const boards = await this.usedBoardService.getAllUsedBoards();
      return ResponseHelper.success(boards);
    } catch (error) {
      return this.handleError(error, 'UsedBoardController.getAll');
    }
  }

  async getUserBoards(userId: string): Promise<NextResponse> {
    try {
      const boards = await this.usedBoardService.getUserUsedBoards(userId);
      return ResponseHelper.success(boards);
    } catch (error) {
      return this.handleError(error, 'UsedBoardController.getUserBoards');
    }
  }
}
