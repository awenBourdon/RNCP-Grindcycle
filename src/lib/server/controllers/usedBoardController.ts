import { type NextRequest, NextResponse } from 'next/server'
import { BaseController } from './baseController'
import { UsedBoardService } from '@/lib/server/services/usedBoardService'
import { UsedBoardValidator } from '@/lib/server/validators/usedBoardValidator'
import { ResponseHelper } from '@/lib/server/utils/responseHelper'
import { API_MESSAGES } from '@/lib/server/config/constants'

export class UsedBoardController extends BaseController {
  constructor(
    private usedBoardService: UsedBoardService = new UsedBoardService()
  ) {
    super()
  }

  async create(req: NextRequest): Promise<NextResponse> {
    try {
      if (this.isFormDataRequest(req)) {
        return await this.handleFormDataRequest(req)
      } else {
        return await this.handleJsonRequest(req)
      }
    } catch (error) {
      return this.handleError(error, 'UsedBoardController.create')
    }
  }

  private async handleFormDataRequest(req: NextRequest): Promise<NextResponse> {
    const formData = await this.extractFormData(req)

    const validation = UsedBoardValidator.validateCreateFormData(formData)
    if (!validation.isValid || !validation.data) {
      return ResponseHelper.validationError(validation.errors)
    }

    const images = formData.getAll('image') as File[]

    const board = await this.usedBoardService.createUsedBoard(validation.data, images)

    return ResponseHelper.created(board, API_MESSAGES.USED_BOARD_CREATED)
  }

  private async handleJsonRequest(req: NextRequest): Promise<NextResponse> {
    const body = await this.extractJsonData(req)

    const validation = UsedBoardValidator.validateCreateJsonData(body)
    if (!validation.isValid || !validation.data) {
      return ResponseHelper.validationError(validation.errors)
    }

    const board = await this.usedBoardService.createUsedBoard(validation.data)

    return ResponseHelper.created(board, API_MESSAGES.USED_BOARD_CREATED)
  }

  async update(req: NextRequest): Promise<NextResponse> {
    try {
      const body = await this.extractJsonData(req)
      const validation = UsedBoardValidator.validateUpdateData(body)

      if (!validation.isValid || !validation.data) {
        return ResponseHelper.validationError(validation.errors)
      }

      const { boardId, updateData } = validation.data

      const result = await this.usedBoardService.updateUsedBoard(boardId, updateData)

      return ResponseHelper.success(result, API_MESSAGES.USED_BOARD_UPDATED)
    } catch (error) {
      if (error instanceof Error && error.message === API_MESSAGES.USED_BOARD_NOT_FOUND) {
        return ResponseHelper.notFound(error.message)
      }
      
      return this.handleError(error, 'UsedBoardController.update')
    }
  }

  async delete(boardId: string): Promise<NextResponse> {
    try {
      const validation = UsedBoardValidator.validateDeleteData(boardId)

      if (!validation.isValid || !validation.data) {
        return ResponseHelper.validationError(validation.errors)
      }

      await this.usedBoardService.deleteUsedBoard(validation.data.boardId)

      return ResponseHelper.successMessage(API_MESSAGES.USED_BOARD_DELETED)
    } catch (error) {
      if (error instanceof Error && error.message === API_MESSAGES.USED_BOARD_NOT_FOUND) {
        return ResponseHelper.notFound(error.message)
      }
      
      return this.handleError(error, 'UsedBoardController.delete')
    }
  }

  async getById(boardId: string): Promise<NextResponse> {
    try {
      const board = await this.usedBoardService.getUsedBoardById(boardId)
      return ResponseHelper.success(board)
    } catch (error) {
      if (error instanceof Error && error.message === API_MESSAGES.USED_BOARD_NOT_FOUND) {
        return ResponseHelper.notFound(error.message)
      }
      
      return this.handleError(error, 'UsedBoardController.getById')
    }
  }

  async getAll(): Promise<NextResponse> {
    try {
      const boards = await this.usedBoardService.getAllUsedBoards()
      return ResponseHelper.success(boards)
    } catch (error) {
      return this.handleError(error, 'UsedBoardController.getAll')
    }
  }

  async getUserBoards(userId: string): Promise<NextResponse> {
    try {
      const boards = await this.usedBoardService.getUserUsedBoards(userId)
      return ResponseHelper.success(boards)
    } catch (error) {
      return this.handleError(error, 'UsedBoardController.getUserBoards')
    }
  }
}