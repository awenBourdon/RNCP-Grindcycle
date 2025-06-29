import { UsedBoard } from '@/generated/prisma';
import { CreateUsedBoardData, UpdateUsedBoardData, UsedBoardFilters, UsedBoardWithRelations } from '@/lib/server/types/usedBoard';

export interface InterfaceUsedBoardRepository {
  create(data: CreateUsedBoardData): Promise<UsedBoard>
  findById(id: string): Promise<UsedBoardWithRelations | null>
  findAll(filters?: UsedBoardFilters): Promise<UsedBoardWithRelations[]>
  update(id: string, data: Partial<UpdateUsedBoardData>): Promise<UsedBoardWithRelations>
  delete(id: string): Promise<void>
  findByUserId(userId: string): Promise<UsedBoardWithRelations[]>
}
