import { UsedBoard, UsedBoardStatus, BoardType, BoardCondition } from '@/generated/prisma';
import { UserService } from '../../users/users-service';
import { PointsHistoryService } from '../../points-history/points-history.service';
import { PaginatedResponse } from '@/lib/utils/pagination';

export interface CreateUsedBoardData {
  name: string;
  userId: string;
  boardType: BoardType;
  boardCondition: BoardCondition;
  description?: string | null;
  image: string[];
}

export interface UpdateUsedBoardData {
  name?: string;
  boardType?: BoardType;
  boardCondition?: BoardCondition;
  description?: string | null;
  image?: string[];
  status?: UsedBoardStatus;
  pointsAwarded?: number;
}

export interface UsedBoardWithRelations extends UsedBoard {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  product?: {
    id: string;
    name: string;
    status: string;
  } | null;
}

export interface InterfaceUsedBoardRepository {
  create(data: CreateUsedBoardData): Promise<UsedBoard>;
  findById(id: string): Promise<UsedBoardWithRelations | null>;
  findAll(): Promise<UsedBoardWithRelations[]>;
  findByUserId(userId: string): Promise<UsedBoardWithRelations[]>;
  findAllWithPagination(page: number, limit: number): Promise<PaginatedResponse<UsedBoardWithRelations>>;
  findByUserIdWithPagination(userId: string, page: number, limit: number): Promise<PaginatedResponse<UsedBoardWithRelations>>;
  findAvailable(): Promise<UsedBoardWithRelations[]>;
  update(id: string, data: UpdateUsedBoardData): Promise<UsedBoardWithRelations>;
  updateWithPointsAndUserTransaction(
    id: string,
    data: UpdateUsedBoardData,
    oldBoard: UsedBoardWithRelations,
    services: {
      pointsHistoryService: PointsHistoryService;
      userService: UserService;
    }
  ): Promise<UsedBoardWithRelations>;
  delete(id: string): Promise<void>;
  findUserById(userId: string): Promise<{ name: string | null } | null>;
}