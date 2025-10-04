import { PointsHistory } from '@/generated/prisma';
import { 
  InterfacePointsHistoryRepository
} from './repository/interface-points-history.repository';
import { PointsHistoryRepository } from './repository/points-history.repository';
import { PaginatedResponse, PaginationParams, normalizePaginationParams } from '@/lib/utils/pagination';

export class PointsHistoryService {
  constructor(
    private pointsHistoryRepository: InterfacePointsHistoryRepository = new PointsHistoryRepository()
  ) {}

  async getUserPointsHistory(userId: string): Promise<PointsHistory[]> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    return await this.pointsHistoryRepository.findByUserId(userId);
  }

  async getUserPointsHistoryWithPagination(
    userId: string,
    params: PaginationParams
  ): Promise<PaginatedResponse<PointsHistory>> {
    if (!userId) {
      throw new Error('ID utilisateur requis');
    }

    const { page, limit } = normalizePaginationParams(params);
    return await this.pointsHistoryRepository.findByUserIdWithPagination(userId, page, limit);
  }

  getRepository(): InterfacePointsHistoryRepository {
    return this.pointsHistoryRepository;
  }
}